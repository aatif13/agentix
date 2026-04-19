import InvestorSidebar from '@/components/InvestorSidebar'

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <InvestorSidebar />
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  )
}
