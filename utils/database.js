import * as SQLite from 'expo-sqlite';

export async function initializeDatabase() {
  //console.log("---------------Tryin to Initialize----------------------");
  try {
    const db = await SQLite.openDatabaseAsync('UserDB.db', {
      useNewConnection: true,
    });

    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    console.log("WAL mode set");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pendingList (
        _id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        job TEXT,
        workAt TEXT,
        age INTEGER
      );
    `);

    console.log("pendingList table created");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contactList (
        _id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        job TEXT,
        workAt TEXT,
        age INTEGER
      );
    `);

    console.log("contactList table created");
    console.log("--------------------Database created successfully--------------");

  } catch (error) {
    console.log("DB init error:", error);
  }
}


export async function insertPendingUser(id,name,email,job,workAt,phone,age) {
  try {
    const db = await SQLite.openDatabaseAsync('UserDB.db',{
      useNewConnection:true,
    });
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const sqlStatement = 'INSERT INTO pendingList (_id,name,email,job,workAt,phone,age) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [id,name,email,job,workAt,phone,age];
    await db.runAsync(sqlStatement,values);
  }catch (error) {console.error("Error during insert:", error);}
}

export async function getPendingList(){
  try{
    const db = await SQLite.openDatabaseAsync('UserDB.db',{
      useNewConnection:true,
    });
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const result = await db.getAllAsync('SELECT * FROM pendingList');
    return result;
  }
  catch(error){
    console.log(error);
  }
}

export async function insertContactUser(id,name,email,job,workAt,phone,age) {
  try{
    const db = await SQLite.openDatabaseAsync('UserDB.db',{
      useNewConnection:true,
    });
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.runAsync('INSERT INTO contactList (_id,name,email,job,workAt,phone,age) VALUES (?, ?, ?, ?, ?, ?, ?)',[id,name,email,job,workAt,phone,age]);
    console.log('User added to contact list');
  }
  catch(error){console.log(error);}
}

export async function deletePendingUser(id){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync('DELETE FROM pendingList WHERE _id = ?', [id]);
  console.log('User deleted from pending list');
}

export async function getContactList() {
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const result = await db.getAllAsync('SELECT * FROM contactList');
  return result;
}
  
export async function getUserById(id) {
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const result = await db.getFirstAsync('SELECT * FROM pendingList WHERE _id = ?', [id]);
  console.log(result);
  return result;
}

export async function deleteContactUser(id){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync('DELETE FROM contactList WHERE _id = ?', [id]);
  console.log('User deleted from contact list');
}

export async function deleteAllContacts(){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync('DELETE FROM contactList');
  console.log('User deleted from contact list');
}

export async function replaceData(id,fieldChanged,newData){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync(`UPDATE contactList SET ${fieldChanged} = ? WHERE _id = ?`,[newData,id]);
  await db.runAsync(`UPDATE pendingList SET ${fieldChanged} = ? WHERE _id = ?`,[newData,id]);
  console.log("userUpdated");
}