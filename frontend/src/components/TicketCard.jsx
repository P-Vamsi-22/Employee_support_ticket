import { Link } from 'react-router-dom'

const PRIORITY_CLASS = { Low: 'low', Medium: 'medium', High: 'high' }
const STATUS_CLASS    = { Open: 'open', 'In Progress': 'inprogress', Resolved: 'resolved', Closed: 'closed' }

export default function TicketCard({ ticket, index = 0 }) {
  return (
    <tr
      className="ticket-row"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <td className="ticket-id-cell">
        <span className="ticket-id">#{String(ticket.id).padStart(4, '0')}</span>
      </td>
      <td className="ticket-title-cell">
        <Link to={`/tickets/${ticket.id}`} className="ticket-link">
          {ticket.title}
        </Link>
        {ticket.description && <span className="ticket-description">{ticket.description}</span>}
      </td>
      <td>
        <span className="category-tag">{ticket.category}</span>
      </td>
      <td>
        <span className={`priority-badge priority-${PRIORITY_CLASS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </td>
      <td>
        <span className={`status-badge status-${STATUS_CLASS[ticket.status]}`}>
          {ticket.status}
        </span>
      </td>
      <td className="ticket-date-cell">
        {new Date(ticket.created_at).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })}
      </td>
      <td>
        <Link to={`/tickets/${ticket.id}`} className="view-link">
          View →
        </Link>
      </td>
    </tr>
  )
}
