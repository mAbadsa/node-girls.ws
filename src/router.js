const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

const mimeType = {
  css: 'text/css',
  js: 'text/js',
  html: 'text/html',
  ico: 'image/x-icon',
  jpg: 'image/jpg',
  png: 'image/png',
};

const handlePublic = (req, res, url) => {
  const extensionFile = url.split('.')[1];
  const pathFile = path.join(__dirname, '..', url);
  fs.readFile(pathFile, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Internal Server Error</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': mimeType[extensionFile] });
      res.end(data);
    }
  });
};

const router = (req, res) => {
  const endpoint = req.url;

  if (endpoint === '/') {
    const pathFile = path.join(__dirname, '..', 'public', 'index.html');
    fs.readFile(pathFile, (error, data) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Internal Server Error</h1>');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (endpoint === '/create-post') {
    let blogpostData = '';
    if (req.method === 'POST') {
      req.on('data', (chunck) => {
        blogpostData += chunck;
      });
      req.on('end', () => {
        const timeStamp = Date.now();
        const pathFile = path.join(__dirname, 'posts.json');

        fs.readFile(pathFile, 'utf-8', (err, data) => {
          if (err && err.code === 'ENOENT') {
            fs.writeFile(
              pathFile,
              JSON.stringify({
                [timeStamp]: querystring.parse(blogpostData).blogpost,
              }),
              (err) => {
                if (err) {
                  // console.log(error);
                  res.writeHead(500, { 'Content-Type': 'text/html' });
                  return res.end('<h1>Internal Server Error</h1>');
                }
              },
            );
          } else {
            // const timeStamp = Date.now();
            const dataPost = JSON.parse(data);
            dataPost[timeStamp] = querystring.parse(blogpostData).blogpost;
            fs.writeFile(pathFile, JSON.stringify(dataPost, null, 4), (err) => {
              if (err) {
                // console.log(error);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                return res.end('<h1>Internal Server Error</h1>');
              }
              res.writeHead(302, {
                'Content-Type': 'text/html',
                Location: '/',
              });
              res.end();
            });
          }
        });
      });
    }
  } else if (endpoint === '/posts') {
    const pathFile = path.join(__dirname, 'posts.json');
    fs.readFile(pathFile, 'utf-8', (err, posData) => {
      if (err) {
        // console.log("error:", err);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Internal Server Error</h1>');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(posData);
      }
    });
  } else if (endpoint.includes('/public')) {
    handlePublic(req, res, endpoint);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('Page Not Found!');
  }
};

module.exports = router;
