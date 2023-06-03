const { spawn } = require('child_process');
const Readable = require('stream').Readable;

const recreateDB = async() => {
  return await new Promise((resolve, reject) => {
    try {
      const s = new Readable();
      s._read = () => {};
      s.push("DROP DATABASE IF EXISTS myclass; CREATE DATABASE myclass;");
      s.push(null);
      const psql = spawn('psql', ['postgresql://postgres:postgres@127.0.0.1:3998/']);
      s.pipe(psql.stdin);
      psql.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);
      });
      
      psql.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject(new Error('recreate db failed'));
      });
      
      psql.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        resolve(0);
      });
    } catch (err) {
      console.error(`stderr: ${err}`);
      reject(new Error('recreate db failed'));
    };
  });
}

const dumpDataToDB = async() => {
  try {
    const recreateStatus = await recreateDB();
    console.log(recreateStatus);
    const psql = spawn('psql', ['postgresql://postgres:postgres@127.0.0.1:3998/myclass']);
    const cat = spawn('cat',['../../test.sql']);
    cat.stdout.pipe(psql.stdin);
    
    psql.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
    });
    
    psql.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    psql.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    }); 
  } catch (err) {
    console.log('HERE ERR')
  };
};

dumpDataToDB();