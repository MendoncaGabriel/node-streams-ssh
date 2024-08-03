//Readable
//Trandform
//Writeble

const crypto = require("crypto")
const { Readable, Writable, Transform } = require("stream")

const input = new Readable({
    read(){
        for(let i = 0; i<10000; i++){

            this.push(crypto.randomUUID()) //pedaço 1
        }
        this.push(null)
    }
})

const toUpperCase = new Transform({
    transform(chunk, encode, callback){
        callback(null, chunk.toString().toUpperCase()) //o primeito item e error caso querita verificar, pode passar null dizendo que não da erro
    }
})
const addHallo = new Transform({
    transform(chunk, encode, callback){
        callback(null, "Hallo" + chunk.toString()) //o primeito item e error caso querita verificar, pode passar null dizendo que não da erro
    }
})

// chunck - pedaço enviados pelo readble
const output = new Writable({
    write(chunck, encode, callback){
        console.log(chunck.toString()) //colocando em stram pois os pedaços chegam como chunks exemplo:(<Buffer 68 61 6c 6c 6f>)
        callback() //informa que terminamos de consumir os dados
    }
})

//conectando input com output
input //entrada
.pipe(addHallo) //meio
.pipe(toUpperCase) //meio
.pipe(output) //saida