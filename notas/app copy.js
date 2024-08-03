//Readable
//Trandform
//Writeble

const { Readable, Writable } = require("stream")

const input = new Readable({
    read(){
        this.push("hallo") //pedaço 1
        this.push("world") //pedaço 2
        this.push(null) // sinalizando que terminamos de enviar dados para nossa esteira
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
input.pipe(output)