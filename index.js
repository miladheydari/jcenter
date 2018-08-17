const express = require('express')
const https = require('https')
const fs = require('fs')

const app = express()


var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            console.log("finish")
            cb(file)
            // file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        console.log("error")
           
        try {
            file.close()
            fs.unlink(dest, function () {
                console.log("error remove")
           
                if (cb) cb(err);
            }); // Delete the file async. (But we don't check the result)

        } catch (e) {
            console.log("error removing when error to download from jcenter", dest);
        }

    });
};


app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})



app.get('/*', (req, res, next) => {

    var urlPaths = req.url.split("/")

    download("https://jcenter.bintray.com" + req.url, "result/" + urlPaths[urlPaths.length - 1],
        function (file) {
            if (file.path) {
                console.log(req.url + "    " + file.path)

                res.download(file.path,
                    function (err) {
                        file.close()
                        try {
                            fs.unlink(file.path);
                        } catch (e) {
                            console.log("error removing ", file.path);
                        }
                    })
            } else {
                console.log(req.url + "    " + file.message)
                res.status(500).send(file.message)

            }
        }
    )

})
const PORT = process.env.PORT
app.listen(PORT, () => console.log('Khafantoornak app listening on port '+PORT))