var mysql = require('mysql');
var dbConfig = {
    connectionLimit    : 5,
    host               : '127.0.0.1',
    port               : 3306,
    database           : 'plj',
    user               : 'root',
    password           : '123456',
    connectTimeout     : 5000,
    waitForConnections : true,
}

var pool = mysql.createPool({
    connectionLimit    : dbConfig.connectionLimit,
    host               : dbConfig.host,
    port               : dbConfig.port,
    database           : dbConfig.database,
    user               : dbConfig.user,
    password           : dbConfig.password,
    connectTimeout     : dbConfig.connectTimeout,
    waitForConnections : dbConfig.waitForConnections,
    //charset            : 'utf8mb4_general_ci'
});

function getConnection(callback){
    pool.getConnection(function(err,connection){
        callback(err, connection)
        if(connection){
            connection.release();
        }
    });
}

//每次查询从数据库连接池中取出一个连接，查询完后释放连接
function query(sql,variable,callback){
    var argumentsCount = arguments.length;
    getConnection(function(err,connection){
        if(err){
            if(argumentsCount === 2){
                callback = variable;
            }
            callback(err,[]);
        }else{
            if(argumentsCount === 2){
                callback = variable;
                connection.query(sql,function(err,results){
                    callback(err,results);
                });
            }else if(argumentsCount === 3){
                connection.query(sql,variable,function(err,results){
                    callback(err,results);
                })
            }
        }
    });
}

exports.query = query;