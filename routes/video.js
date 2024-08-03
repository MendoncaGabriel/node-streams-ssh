const express = require("express")
const router = express.Router()
const controller = require("../controller/stream")

// stream de video
router.get('/:folder/:fileName', controller.stream);

// getdata video 

// {
//     nome: "naruto",
//     descricao: "bla bla bla"
//     temporadas: [
//         {
//             tp: 1, 
//             episodios: [
//                 {
//                     ep: 1,
//                     video: "caminho.com.br"
//                 }
//             ]
//         }
//     ]
// }

module.exports = router