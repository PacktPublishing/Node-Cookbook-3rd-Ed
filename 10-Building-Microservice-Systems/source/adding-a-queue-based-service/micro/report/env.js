'use strict'

// provides environment variable setup for concordant

const env = {
  DNS_NAMESPACE: 'micro',
  DNS_SUFFIX: 'svc.cluster.local'
}

if (process.env.NODE_ENV !== 'production') {
  Object.assign(env, {  
    DNS_HOST: '127.0.0.1',
    DNS_PORT: '53053'
  })
}

Object.assign(process.env, env)