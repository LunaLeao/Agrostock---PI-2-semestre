const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Isso configura o middleware de upload

const vendaController = require("../controllers/vendaController");


router.post('/gerar-relatorio-vendas', vendaController.gerarRelatorioVendas);
router.get('/venda-fornecedor', vendaController.renderizarVenda );
router.post('/add-vendas', upload.none(), vendaController.cadastrarVenda);
router.post('/add-comprador', vendaController.adicionarComprador);
router.post('/atualizar-vendas', vendaController.atualizarVenda);
router.delete('/vendas/:id', vendaController.deletarVenda);
router.get('/pesquisarVenda', vendaController.pesquisarVenda);
router.get('/consultarColheita', vendaController.consultarColheita);
  
module.exports = router;