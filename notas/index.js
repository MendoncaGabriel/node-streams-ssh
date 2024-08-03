const fs = require('fs')
const { Readable, Writable, Transform } = require("stream")

const SEED_PATH = "./seed.txt"
const OUT_PATH = "./big-file.txt"

async function main(){
    await generateFile()
    countFileWords()
}

function generateFile() {
    return new Promise((resolve, reject) => {
        const seed = fs.readFileSync(SEED_PATH, "utf-8")
        const targetSize = Math.pow(1024, 3)
        const repetitions = Math.ceil(targetSize / seed.length)

        console.time("generate file")
        const generate = new Readable({ //Readable a função dele e gerar dado seja criando ou lendo
            read() {
                for (let i = 0; i < repetitions; i++) {
                    this.push(seed)
                }
                this.push(null)
            }
        })

        const outFile = fs.createWriteStream(OUT_PATH)

        generate.pipe(outFile)
        generate.on("end", () => {
            console.timeEnd("generate file")
            resolve()
        })
    })
}

function countFileWords(){
    console.time("count words")
    const bigFile = fs.createReadStream(OUT_PATH)

    const countWord = new Transform({
        transform(chunk, encoding, callback){
            const words = chunk.toString().split(" ")
            this.wordCount = (this.wordCount ?? 0) + words.length
            callback()
        },
        flush(callback){
            this.push(this.wordCount.toString())
            callback()
        }
    })

    bigFile.pipe(countWord).pipe(process.stdout)
    countWord.on("end", ()=>{
        console.timeEnd("count words")

    })
}
main()