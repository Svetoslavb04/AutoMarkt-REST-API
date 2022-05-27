const isName = (value) => /^[\w'\-,.][^0-9_!¡?÷?¿\/\\+=@#$%ˆ&*(){}|~<>;:[\]]+$/.test(value);

const isPhoneNumber = (value) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value);

const isZIP = (value) => /^[A-Z0-9]+$/.test(value);

module.exports = {
    isName,
    isPhoneNumber,
    isZIP
}