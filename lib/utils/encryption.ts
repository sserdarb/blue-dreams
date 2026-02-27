import crypto from 'crypto'

// Use a secure key from env, or fallback for dev
// Key must be exactly 32 bytes (256 bits) for aes-256-cbc
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars!'
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16 // For AES, this is always 16

// Ensure the key is exactly 32 characters
const getKey = () => {
    // If it's a 64-char hex string from a crypto random generator, buffer it
    if (ENCRYPTION_KEY.length === 64) {
        return Buffer.from(ENCRYPTION_KEY, 'hex')
    }
    // Otherwise pad or truncate to 32 bytes
    const keyBuffer = Buffer.alloc(32)
    keyBuffer.write(ENCRYPTION_KEY)
    return keyBuffer
}

export const EncryptionUtils = {
    encrypt: (text: string): string => {
        if (!text) return text
        try {
            const iv = crypto.randomBytes(IV_LENGTH)
            const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
            let encrypted = cipher.update(text, 'utf8', 'hex')
            encrypted += cipher.final('hex')
            // Return iv:encryptedData
            return `${iv.toString('hex')}:${encrypted}`
        } catch (error) {
            console.error('[Encryption Error]', error)
            return text // Return original if encryption fails to not completely break the app in edge cases
        }
    },

    decrypt: (text: string): string => {
        if (!text || !text.includes(':')) return text
        try {
            const textParts = text.split(':')
            const ivHex = textParts.shift()
            if (!ivHex) return text

            const iv = Buffer.from(ivHex, 'hex')
            const encryptedText = Buffer.from(textParts.join(':'), 'hex')

            const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
            let decrypted = decipher.update(encryptedText)
            decrypted = Buffer.concat([decrypted, decipher.final()])
            return decrypted.toString('utf8')
        } catch (error) {
            console.error('[Decryption Error]', error)
            return text
        }
    }
}
