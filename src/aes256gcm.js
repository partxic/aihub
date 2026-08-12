import crypto from 'crypto'

const alg = 'aes-256-gcm'
const hashAlg = 'sha256'
let secretKey = null

export const setSecret = secret => {
    secretKey = crypto.createHash(hashAlg).update(secret).digest()
}

export const encrypt = text => {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(alg, secretKey, iv)
    const data = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')
    return `${iv.toString('hex')}:${authTag}:${data}`
}

export const decrypt = data => {
    const [ivHex, authTagHex, encryptedText] = data.split(':')
    if (!ivHex || !authTagHex || !encryptedText) {
        throw new Error('密文格式不正确')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(alg, secretKey, iv)
    decipher.setAuthTag(authTag)

    return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
}
