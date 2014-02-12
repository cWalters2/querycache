var mysql = require("mysql");
querycache();
function querycache() {
//sample statement: "INSERT INTO test (foo) VALUES (3)"
// may appear nonsensical; was written for a hastily made test server. 
	var statement = process.argv.slice(2);
	//console.log('myArgs: ', statement);
	cacheinsert(statement[0]);
}

function cacheinsert(statement) {
  //first store query in local cache
  //local cache is expected to be a table named 'stcache'
  //stcache is to be a 2tuple consisting of:
  //    INT id NOT NULL AUTO_INCREMENT
  //    varchar(n) statement NOT NULL
	var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'test'
	});
	var insert = "INSERT INTO stcache (statement) VALUES ('"+statement+"')";
	connection.connect();
	connection.query(insert, function(err, rows, fields) {//store statement
		if (err) throw err;
		console.log('statement cached');
	});
	//only half the 2-tuple is known (statement). Check what id was assigned to our statement
	var id=0;
	connection.query("SELECT id FROM stcache WHERE statement = '" + statement + "'", function(err, rows, fields) {
		if (err) throw err;
		else id = rows[0].id;
	});
	connection.end();
	//query statement to the DB
	var remote = mysql.createConnection({
	host	:	'127.0.0.1:3306',
	user     : 'root',
	password : 'root',
	database : 'test'
	});
	console.log('querying statement...');
	remote.connect();
	remote.query(statement, function(err, rows, fields) {
		if (err) throw err;
		console.log('statement queried sucessfully');
		clearCache(id);//clear the cache, now that the statement has completed 
		//this is where the id that was obtained earlier is used
	});
	remote.end();
}
function clearCache(id){
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'test'
  });
  var delstat = 'DELETE FROM stcache WHERE id = ' + id; //find cached statement
  connection.connect();
  connection.query(delstat, function(err, rows, fields) {//delete the statement
  if (err) throw err;
  });
  connection.end();//done
  console.log('cache with id=' +id+' cleared');
}	
