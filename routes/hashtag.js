const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const reqQuery = req.query
    let errorMsgs = []
    let windowData = []
    switch (reqQuery.qt) {
        case 'create':
            if (simpleValidate(reqQuery, ['hashtag', 'number_of_posts'])) {
                let query = `INSERT INTO Hashtag VALUES ("${reqQuery.hashtag}", "${reqQuery.number_of_posts}");`
                try {
                    await sql.query(query)
                    windowData.push({
                        url: reqQuery.hashtag,
                        number_of_posts: reqQuery.number_of_posts
                    })
                } catch (e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'search':
            if (simpleValidate(reqQuery, ['hashtag'])) {
                let query = `SELECT SUM(number_of_posts) as totalNum FROM Hashtag WHERE hashtag LIKE "%${reqQuery.hashtag.trim()}%";`
                try {
                    const queryResult = await sql.query(query)
                        windowData.push({
                            url: reqQuery.hashtag,
                            number_of_posts: queryResult[0].totalNum})
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'update':
            if (simpleValidate(reqQuery, ['hashtag', 'number_of_posts'])) {
                let query = `UPDATE Hashtag SET hashtag="${reqQuery.hashtag}", number_of_posts="${reqQuery.number_of_posts}" WHERE hashtag="${reqQuery.hashtag}"`
                
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    } else {
                        windowData.push({
                            url: reqQuery.hashtag,
                            number_of_posts: reqQuery.number_of_posts
                        })
                    }
                } catch (e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'delete':
            if (simpleValidate(reqQuery, ['hashtag'])) {
                let query = `DELETE FROM Hashtag WHERE hashtag="${reqQuery.hashtag}";`
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    }
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'advanced':
            let query = 'SELECT a.username as user, current_follower_count as curfol, totalLikes FROM Accounts a JOIN (SELECT username, SUM(likes) AS totalLikes FROM Post GROUP BY username) AS p ON a.username = p.username ORDER BY totalLikes DESC'
            try {
                const result = await sql.query(query)
                for (const row of result) {
                    windowData.push({
                        url: row.user,
                        number_of_posts: row.totalLikes,
                        a: row.curfol
                    })
                }
            } catch(e) {
                console.error(e)
                errorMsgs.push('Operation Failed!')
                errorMsgs.push(e.message)
            }
            break
        }
    res.render('hashtags', {errors: errorMsgs, windowData:windowData})
})


const simpleValidate = (query, vals) => {
    for (const val of vals) {
        if (!query.hasOwnProperty(val) || query[val] === '') {
            return false
        }
    }
    return true
}

module.exports = router