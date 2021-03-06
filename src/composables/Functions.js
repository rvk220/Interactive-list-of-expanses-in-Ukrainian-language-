import { setInterval } from 'core-js';
import ls from '../composables/LocalStorage.js';
import s from './Strings.js';
const functions = {
    isInputCorrect(vueObj) {
        const { inputProdCost, inputProdPrice, lang } = vueObj;
        if(inputProdCost < 0.01 || inputProdPrice < 0) {
            vueObj.alert = {
                text: s.errorWrongProductInput[lang],
                isShown: true
            };
            return false;
        }
        return true;
    },

    getProductObject(vueObj) {
        const toFixed = (str, isMoney = true) => {
            const num = Number(Number(str).toFixed(2)); // to handle the famous floating point precision problem
            str = (Number.isInteger(num) || !isMoney) ? num.toString(10) : num.toFixed(2);
            return num === 0 ? '' : str;
        }
        if(!functions.isInputCorrect(vueObj)) return null;
        const { unit, calcType, inputProdName, inputProdPrice,
            inputProdQuantity, inputProdCost, isApprox, units, lang } = vueObj;
        return { name: inputProdName.trim(), price: toFixed(inputProdPrice),
            quantity: toFixed(inputProdQuantity, false), cost: toFixed(inputProdCost),
            unitName: units[unit][lang], isApprox, calcType };
    },

    autoCalc(vueObj) {
        if(vueObj.calcType === '0') {
            const price = +vueObj.inputProdPrice, quantity = +vueObj.inputProdQuantity;
            vueObj.inputProdCost = String(price ? (quantity ? +(price * quantity).toFixed(2) : price) : '');
        } else {
            const price = +vueObj.inputProdPrice, cost = +vueObj.inputProdCost;
            vueObj.inputProdQuantity = cost ? String(price == 0 ? '' : +(cost / price).toFixed(2)) : '';
        }
    },

    confirm(vueObj, confirmText, callback) {
        vueObj.confirm = { text: confirmText, fn: callback, isShown: true };
    },

    askIfDeleteAll(vueObj) {
        functions.confirm(vueObj, s.confirmClearList[vueObj.lang], () => {
            ls.clearProducts();
            vueObj.products = [];
        });
    },

    copyToClipboard(str, vueObj) {
        const temp = document.createElement('textarea');
        temp.value = str;
        document.body.appendChild(temp);
        temp.select();
        temp.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(temp);
        vueObj.alert = {
            text: [
                'Скопійовано до буферу обміну: ', 'Скопировано в буфер обмена: ', 'Copied to clopboard: '
            ][vueObj.lang] + '\n"' + temp.value + '".',
            isShown: true
        };
    },

    copyListToClipboard(vueObj) {
        const ul = vueObj.$refs.ul;
        const str = Array.prototype.reduce.call(ul.children, (result, li, i) => {
            return result + li.innerHTML + (i < ul.children.length - 1 ? ';\n' : '.');
        }, '') + '\n' + vueObj.$refs.sumText.textContent.toUpperCase();
        functions.copyToClipboard(str, vueObj);
    },

    copyItemToClipboard(vueObj, index) {
        const li = vueObj.$refs.ul.children[index];
        let timer = setInterval(() => {
            if(vueObj.showEditModalInd === -1) {
                functions.copyToClipboard(li.textContent.replace(/^\d+\)\s/, ''), vueObj);
                window.clearInterval(timer);
            }
        }, 10);
    },

    removeProduct(ind, vueObj) {
        let timer = setInterval(() => {
            if(vueObj.showEditModalInd === -1) {
                functions.confirm(vueObj, [
                    'Ви справді бажаєте видалити продукт №',
                    'Вы действительно желаете удалить продукт №',
                    'Are you sure you wish to remove the product #'
                ][vueObj.lang] + `${1 + ind} "${vueObj.products[ind].name || s.defaultProdName[vueObj.lang]}"?`,
                () => {
                    vueObj.products.splice(ind, 1);
                    ls.setProducts(vueObj.products);
                });
                window.clearInterval(timer);
            }
        }, 10);
    },

    showEdit(ind, vueObj) {
        vueObj.indexOfEditedItem = ind;
    }
}

export default functions;