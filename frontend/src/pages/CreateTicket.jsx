import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../api/client'
import TicketForm from '../components/TicketForm'

export default function CreateTicket() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async data => {
    setLoading(true)
    try {
      const ticket = await ticketApi.create(data)
      navigate(`/tickets/${ticket.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Ticket</h1>
          <p className="page-sub">Describe your issue clearly so we can resolve it faster.</p>
        </div>
      </div>
      <div className="form-card">
        <TicketForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}
