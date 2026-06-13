const QRCode = require('qrcode');

// Gerador de payload PIX estático (EMV/BR Code)
const gerarPayloadPix = ({ chave, nome, cidade, valor, txid, descricao }) => {
  const formatField = (id, value) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const merchantAccountInfo = formatField('00', 'BR.GOV.BCB.PIX') + formatField('01', chave);
  const merchantAccount = formatField('26', merchantAccountInfo);

  const valorFormatado = parseFloat(valor).toFixed(2);
  const txidFormatado = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25);

  let payload =
    formatField('00', '01') +
    merchantAccount +
    formatField('52', '0000') +
    formatField('53', '986') +
    formatField('54', valorFormatado) +
    formatField('58', 'BR') +
    formatField('59', nome.substring(0, 25)) +
    formatField('60', cidade.substring(0, 15)) +
    formatField('62', formatField('05', txidFormatado)) +
    '6304';

  // CRC16
  const crc = crc16(payload);
  return payload + crc;
};

const crc16 = (str) => {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xFFFF).toString(16).toUpperCase()).padStart(4, '0');
};

const gerarPix = async ({ valor, txid, descricao }) => {
  const pixKey = process.env.PIX_KEY || 'admin@streamflix.com';
  const merchantName = process.env.PIX_MERCHANT_NAME || 'StreamFlix';
  const merchantCity = process.env.PIX_MERCHANT_CITY || 'Sao Paulo';

  const payload = gerarPayloadPix({
    chave: pixKey,
    nome: merchantName,
    cidade: merchantCity,
    valor,
    txid,
    descricao,
  });

  const qrCodeBase64 = await QRCode.toDataURL(payload);

  return {
    pixCopiaECola: payload,
    qrCodeBase64,
    txid,
    valor,
    expiracao: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
  };
};

module.exports = { gerarPix };
