'use strict'
require('./env')
const { dns } = require('concordant')()
const redis = require('redis')
const CliTable = require('cli-table')
const QNAME = 'eventservice'
const RESPONSE_QUEUE = 'summary'
const ENDPOINT = '_main._tcp.redis.micro.svc.cluster.local'

dns.resolve(ENDPOINT, report)

function report (err, locs) {
  if (err) { return console.log(err) }
  const { port, host } = locs[0]
  const client = redis.createClient(port, host)
  const event =  JSON.stringify({
    action: 'summary',
    returnPath: RESPONSE_QUEUE
  })

  client.lpush(QNAME, event, (err) => {
    if (err) { 
      console.error(err)
      return  
    }

    client.brpop(RESPONSE_QUEUE, 5, (err, data) => {
      if (err) { 
        console.error(err)
        return  
      }
      const summary = JSON.parse(data[1])
      const cols = Object.keys(summary).map((url) => [url, summary[url]])
      const table = new CliTable({
        head: ['url', 'count'],
        colWidths: [50, 10]
      })
      table.push(...cols)
      console.log(table.toString())
      client.quit()
    })
  })
}