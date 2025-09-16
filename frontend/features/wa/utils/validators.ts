import { WA_CONFIG } from "../config/constants"

export const validateMessage = (content: string): boolean => {
  return content.trim().length > 0 && content.length <= WA_CONFIG.MAX_MESSAGE_LENGTH
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file: File): boolean => {
  return file.size <= WA_CONFIG.MAX_FILE_SIZE
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
