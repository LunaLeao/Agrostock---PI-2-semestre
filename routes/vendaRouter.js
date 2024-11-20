const express = require("express");
const router = express.Router();


const vendaController = require("../controllers/vendaController");

router.post('/gerar-relatorio-vendas', vendaController.gerarRelatorioVendas);
router.get('/venda-fornecedor', vendaController.renderizarVenda );
router.post('/add-vendas', vendaController.cadastrarVenda);
router.post('/add-comprador', vendaController.adicionarComprador);
router.post('/atualizar-vendas', vendaController.atualizarVenda);
router.delete('/vendas/:id', vendaController.deletarVenda);
router.get('/pesquisarVenda', vendaController.pesquisarVenda);

  
module.exports = router;