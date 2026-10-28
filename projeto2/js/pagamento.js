
const botaoPagar = document.getElementById("botaoPagar");
const opcoesCartao = document.getElementById("opcoes-cartao");

const formasPagamento = document.querySelectorAll(
    'input[name="pagamento"]'
);

function atualizarFormaPagamento() {
    const selecionado = document.querySelector(
        'input[name="pagamento"]:checked'
    );

    if (opcoesCartao) {
        opcoesCartao.hidden =
            !selecionado || selecionado.value !== "cartao";
    }
}

formasPagamento.forEach((opcao) => {
    opcao.addEventListener("change", atualizarFormaPagamento);
});

atualizarFormaPagamento();

if (botaoPagar) {
    botaoPagar.addEventListener("click", async () => {
        const clienteId = localStorage.getItem("id_cliente");

        if (!clienteId) {
            alert("Faça login para continuar.");
            return;
        }

        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!selecionado) {
            alert("Selecione Pix ou cartão.");
            return;
        }

        if (!Array.isArray(carrinhoAtual) || carrinhoAtual.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const forma = selecionado.value;
        let tipoCartao = null;

        if (forma === "cartao") {
            tipoCartao = document.getElementById("tipoCartao")?.value;

            if (!["credito", "debito"].includes(tipoCartao)) {
                alert("Selecione crédito ou débito.");
                return;
            }
        }

        const total = carrinhoAtual.reduce((soma, produto) => {
            return soma + (Number(produto.valor) || 0);
        }, 0);

        if (!Number.isFinite(total) || total <= 0) {
            alert("Não foi possível calcular o valor da compra.");
            return;
        }

        const valorFormatado = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const nomeForma = forma === "pix"
            ? "Pix"
            : `Cartão de ${tipoCartao}`;

        if (!confirm(
            `CONFIRMAR PAGAMENTO\n\n` +
            `Forma: ${nomeForma}\n` +
            `Total: ${valorFormatado}\n\n` +
            `Deseja continuar?`
        )) {
            return;
        }

        botaoPagar.disabled = true;

        try {
            const resposta = await fetch(
                "http://localhost:3000/pagamento",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cliente_id: Number(clienteId),
                        forma_pagamento: forma,
                        tipo_cartao: tipoCartao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Erro ao registrar o pagamento."
                );
            }

            alert(
                `Solicitação registrada!\n\n` +
                `Forma: ${nomeForma}\n` +
                `Total: ${valorFormatado}\n` +
                `Status: ${dados.status}`
            );

        } catch (erro) {
            console.error("Erro no pagamento:", erro);
            alert(erro.message || "Erro ao processar o pagamento.");
        } finally {
            botaoPagar.disabled = false;
        }
    });
}
