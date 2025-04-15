import * as SQLite from 'expo-sqlite';

export async function initializeDatabase() {
  try {
    const db = await SQLite.openDatabaseAsync('UserDB.db', {
      useNewConnection: true,
    });

    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    console.log("WAL mode set");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pendingList (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        job TEXT,
        workAt TEXT,
        avatar TEXT,
        age INTEGER
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contactList (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        job TEXT,
        workAt TEXT,
        avatar TEXT,
        age INTEGER
      );
    `);
  } catch (error) {
    console.log("DB init error:", error);
  }
}


export async function insertPendingUser(id,name,email,job,workAt,phone,cloudinary,age) {
  try {
    const db = await SQLite.openDatabaseAsync('UserDB.db',{
      useNewConnection:true,
    });
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const sqlStatement = 'INSERT INTO pendingList (id,name,email,job,workAt,phone,avatar,age) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [id, name, email, job, workAt, phone, cloudinary,age];
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

export async function insertContactUser(id,name,email,job,workAt,phone,cloudinary,age) {
  try{
    const db = await SQLite.openDatabaseAsync('UserDB.db',{
      useNewConnection:true,
    });
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.runAsync('INSERT INTO contactList (id,name,email,job,workAt,phone,avatar,age) VALUES (?, ?, ?, ?, ?, ?, ?,?)',[id,name,email,job,workAt,phone,cloudinary,age]);
  }
  catch(error){console.log(error);}
}

export async function deletePendingUser(id){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync('DELETE FROM pendingList WHERE id = ?', [id]);
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

export async function deleteContactUser(id){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync('DELETE FROM contactList WHERE id = ?', [id]);
}

export async function replaceData(id,fieldChanged,newData){
  const db = await SQLite.openDatabaseAsync('UserDB.db',{
    useNewConnection:true,
  });
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.runAsync(`UPDATE contactList SET ${fieldChanged} = ? WHERE id = ?`,[newData,id]);
  await db.runAsync(`UPDATE pendingList SET ${fieldChanged} = ? WHERE id = ?`,[newData,id]);
}