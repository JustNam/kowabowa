'use client'
import { Modal } from '@/atoms/modal'

interface ProfileEditProps {
  open: boolean
  onClose: () => void
}

export function ProfileEdit({open, onClose} : ProfileEditProps)