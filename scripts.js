// Use const para quando não terá aleterações, e let para alterações. (tente não usar var)
const Modal = {
  // Abrir modal, e  para isso, adicionar a classe active ao modal.
  open() {
    // document object Modal (DOM). queryselector é uma pesquisa no seletor CSS: Pesquisa pelo seletor que vou por dentro dos parenteses. Ele vai retornar um objeto. A classList é uma propriedade do DOM, que é um objeto. A funcionalidade dela é add a classe que vou por dentro dos parenteses.
    document.querySelector(".modal-overlay").classList.add("active");
  },
  // fechar o modal, e para isso, remover a classe active do modal.
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
    Form.clearFields()
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

// Vamos criar um array para a tabela.
const Transaction = {
  all: Storage.get(),

  // para add uma transaction (no botão + Nova Transação)
  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  // para remover uma transação no botão vermelho redondo de menos.
  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  // somar as entradas
  incomes() {
    // pegar todas as transações, verificar se é maior que 0 e se for maior que 0, somar a uma variavel e retornar.
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  // somar as saídas
  expenses() {
    // fazer o inverso do incomes
    let expense = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    })
    return expense;
  },

  // remover das entradas o valor das saídas para ter o total.
  total() {
    // fazer income - expense
    return Transaction.incomes() + Transaction.expenses();
  }
}

// Substitua os dados do HTML com os dados do JS.
// DOM = Document Object Modal (Documento de modelagem do objeto)
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação" />
                </td>
            `

    return html;
  },

  updateBalance() {
    document
      .getElementById("incomeDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes())

    document
      .getElementById("expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    
    document
    .getElementById("totalDisplay")
    .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
};

// coisas uteis para organizar
const Utils = {
  // retirar do valor, qualquer coisa errada que possa ser posto. Ex: ao inves de usar numero puro, usar uma ,00
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100;

    return value;
  },

  // formato de data errado como: ano, mes e dia.
  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    // add sinal de positivo ou negativo
    const signal = Number(value) < 0 ? "-" : "";

    // A string tem dentro dela uma funcionalidade de replace (troca).  /\/g <-- Este sinal chama-se slach, e significa que vamos trocar num escopo global (g) determinada coisa.
    value = String(value).replace(/\D/g, "");

    // Para definir as casas decimais:
    value = Number(value) / 100;

    // Para o sinal da moeda
    value = value.toLocaleString("pt-PT", {
      style: "currency",
      currency: "EUR",
    })

    return signal + value;
  },
};

// Para o formulário
const Form = {
  // linkar com o HTML:
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  // verificar se todas as informações foram preenchidas
  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "" ) {
        throw new Error("Por favor, preencha todos os campos!");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date,
    };
  },

  // apagar os dados do formulario (limpar os campos)
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  // submit para salvar (também mudei no HTML)
  submit(event) {
    event.preventDefault();

    try {
      // Formatar os dados para salvar
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction)
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  }
};

// ------------------- Começamos a Executar ------------------
const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
