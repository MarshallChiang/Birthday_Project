var express = require('express');
var router = express.Router()

const file = './public/dev.db';
const sqliteConfig = { 
    //  query statement collections
    init_table:     "CREATE TABLE IF NOT EXISTS Game (player TEXT NOT NULL, point INTEGER DEFAULT 0, prize TEXT, PRIMARY KEY(player))",
    init_user:      "INSERT OR IGNORE INTO Game VALUES(?, 0, '')",
    get_user:       "SELECT * FROM Game WHERE player = ?",
    update_user:    "UPDATE Game SET __ = ? WHERE player = ?" ,

    //  aggregate function for update clause
    point: (c, n)=> { return parseInt(c) + parseInt(n) }, 
    prize: (c, n)=> { return c.split(',').concat([n]).join(',') }
}

var sqlite3 = require('sqlite3').verbose();



// params spec ?session
router.get('/:method', function(req, res){
    var db = new sqlite3.Database(file);
    // init table and session when not exist.
    db.run(sqliteConfig.init_table);  
    db.run(sqliteConfig.init_user, [req.session.id]); 

    switch (req.params.method) {
        //  e.g "ajax/update?target=point&value=10" 
        //  update sqlite with defined column and value in querystring, and return the latest
        case 'update':  
            db.serialize(() => {
                db.each(sqliteConfig.get_user, [req.session.id], (err, row) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // use `target` parameter to factory the aggregate function in sqliteStatic for update value
                        db.run(sqliteConfig.update_user.replace('__', req.query.target), 
                        [sqliteConfig[req.query.target](row[req.query.target], req.query.value), req.session.id], 
                        (err) => {
                            db.get(sqliteConfig.get_user, [req.session.id], (err, row) => {
                                res.json(row);
                                db.close();
                            })
                        });
                    }
                })
            }) 
            break
        case 'query':
            db.get(sqliteConfig.get_user, [req.session.id], (err, row) => {
                res.json(row);
                db.close();
            })
            break

        default :
            db.close();
            res.send('Invalid Method');
            
    }
})



module.exports = router
