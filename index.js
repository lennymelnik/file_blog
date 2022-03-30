const fs = require('fs');
const process = require('process');
const glob = require("glob");

const express = require('express');
const app = express()
const ejs = require('ejs');
const port = 3000
require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
app.set('view engine', 'ejs');

function getTags() {

    var getDirectories = function (src, callback) {
        glob(src + '/**/*', callback);
      };
      getDirectories('Vintage', function (err, res) {
        if (err) {
          console.log('Error', err);
        } else {
          var allFiles = res.filter((item)=> item.includes('.txt'))
          console.log("all files", allFiles)
          var tags = {}
          for(i = 0;i<allFiles.length;i++){
              //Remove the vintage folder so that it works with API
              allFiles[i] = allFiles[i].replace('Vintage/','')
              var thisFile = require("./Vintage/"+allFiles[i])
              var allTags = thisFile.split('\n')[0].split('#').slice(1)
              for(x=0;x<allTags.length;x++){
                  allTags[x] = allTags[x].trim()
                  if(tags[allTags[x]]){
                      tags[allTags[x]].push(allFiles[i])
                  }else{
                      tags[allTags[x]] = [allFiles[i]]
                  }
              }
          
      
          }
          console.log(tags)
          return tags

        }
      });
}

app.get('/', (req, response) => {
    fs.readdir(process.cwd()+'/Vintage', { withFileTypes: true }, (error, files) => {
        const directoriesInDIrectory = files
            .filter((item) => item.isDirectory() && !['node_modules','views'].includes(item.name))
            .map((item) => item.name);
            var getDirectories = function (src, callback) {
                glob(src + '/**/*', callback);
              };
              getDirectories('Vintage', function (err, res) {
                if (err) {
                  console.log('Error', err);
                } else {
                  var allFiles = res.filter((item)=> item.includes('.txt'))
                  console.log("all files", allFiles)
                  var tags = {}
                  for(i = 0;i<allFiles.length;i++){
                      //Remove the vintage folder so that it works with API
                      allFiles[i] = allFiles[i].replace('Vintage/','')
                      var thisFile = require("./Vintage/"+allFiles[i])
                      var allTags = thisFile.split('\n')[0].split('#').slice(1)
                      for(x=0;x<allTags.length;x++){
                          allTags[x] = allTags[x].trim()
                          if(tags[allTags[x]]){
                              tags[allTags[x]].push(allFiles[i])
                          }else{
                              tags[allTags[x]] = [allFiles[i]]
                          }
                      }
                  
              
                  }
                  console.log(tags)
                  response.render('pages/main',{
                    folders: directoriesInDIrectory,
                    tags : tags
        
                  });
        
                }
              });
        
        

    });
})

app.get('/tags/:tagName', (req, response) => {

    req.params.tagName = req.params.tagName.replace('@',' ')
  
    var getDirectories = function (src, callback) {
        glob(src + '/**/*', callback);
      };
      getDirectories('Vintage', function (err, res) {
        if (err) {
          console.log('Error', err);
        } else {
          var allFiles = res.filter((item)=> item.includes('.txt'))
          console.log("All files", allFiles)
          var tags = {}
          for(i = 0;i<allFiles.length;i++){
              //Remove the vintage folder so that it works with API
              allFiles[i] = allFiles[i].replace('Vintage/','')
              var thisFile = require("./Vintage/"+allFiles[i])
              var allTags = thisFile.split('\n')[0].split('#').slice(1)
              for(x=0;x<allTags.length;x++){
                  allTags[x] = allTags[x].trim()
                  if(tags[allTags[x]]){
                      tags[allTags[x]].push(allFiles[i])
                  }else{
                      tags[allTags[x]] = [allFiles[i]]
                  }
              }
          
      
          }
          console.log("These are the fils for this tag", tags[req.params.tagName])
          if(tags[req.params.tagName]){
            response.render('pages/tag',{
                thisTag: req.params.tagName,
                posts : tags[req.params.tagName]
    
              });
          }else{
              response.send("That tag does not have any posts")
          }
         

        }
      });
    

       
    
})

app.get('/folder/:folderName', (req, res) => {
        if(['node_modules','views'].includes(req.params.folderName)){
            res.send("Oh you sly bastard")
        }
        
 
            fs.readdir(process.cwd()+"/Vintage/"+req.params.folderName, { withFileTypes: true }, (error, files) => {
                if(error){
                    res.send("Oops something happened")
                }else{
                    const filesInDirectory = files
                    .filter((item) => !item.isDirectory())
                    .map((item) => item.name);
        
                    res.render('pages/posts',{
                        folder: req.params.folderName,
                        posts : filesInDirectory,
                      });                }
         
        
            });
        
})


app.get('/folder/:folderName/:fileName', (req, res) => {
    console.log(req.params.folderName)
    
    fs.readFile(process.cwd()+"/Vintage/"+req.params.folderName+"/"+req.params.fileName, 'utf8' , (err, data) => {
        if (err) {
            res.send("Oops, I don't think this page exists")
            return
        }
        fs.stat(process.cwd()+"/Vintage/"+req.params.folderName+"/"+req.params.fileName, (err, stats) => {
            if(err) {
                throw err;
            }
            // print file last modified date
            //get tags
            var allTags = data.split('\n')[0].split('#').slice(1)
            console.log("alltags",allTags)

            var createdTime = stats.birthtime
            var lastModified = stats.mtime
            res.render('pages/post',{
                data: data.split('\n').slice(1),
                lastModified : lastModified,
                createdTime : createdTime,
                postTitle : req.params.fileName.replace('.txt',''),
                tags : allTags
              });    
        });
    })
    
    
   
   

})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

