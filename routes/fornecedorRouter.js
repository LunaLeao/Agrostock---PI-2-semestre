const express = require("express");
const router = express.Router();


const fornecedorController = require("../controllers/fornecedorController");


router.get('/fornecedores', fornecedorController.renderizarFornecedor );
router.post('/add-fornecedor', fornecedorController.adicionarFornecedor);
router.post('/atualizar-fornecedor', fornecedorController.atualizarFornecedor);
router.delete('/fornecedor/:id', fornecedorController.deletarFornecedor);
 
module.exports = router;
