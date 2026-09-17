import type { Access, FieldAccess } from 'payload'

type UserWithRole = { role?: 'admin' | 'editor' } | null

const roleFor = (user: unknown) => (user as UserWithRole)?.role

export const isAdmin: Access = ({ req }) => roleFor(req.user) === 'admin'

export const isEditor: Access = ({ req }) => {
  const role = roleFor(req.user)
  return role === 'admin' || role === 'editor'
}

export const publishedOrEditor: Access = ({ req }) => {
  if (roleFor(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const sourceFieldsReadOnly: FieldAccess = ({ req }) => roleFor(req.user) === 'admin'
