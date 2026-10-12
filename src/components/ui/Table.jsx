// src/components/ui/Table.jsx
export function Table({
  headers = [],
  children,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-md ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3.5 text-[11px] font-mono uppercase tracking-wider text-[#8a8a93] font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr
      className={`transition-colors duration-150 hover:bg-white/[0.03] ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-3.5 text-white whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  )
}
