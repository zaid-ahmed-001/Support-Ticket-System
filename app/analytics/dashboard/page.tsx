'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { getRawDataForExport } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import * as XLSX from 'xlsx'

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false)

  const handleDownloadCSV = async () => {
    setLoading(true)
    const data = await getRawDataForExport()
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    const csvContent = [headers, ...rows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hosho_support_data.csv'
    a.click()
    setLoading(false)
  }

  const handleDownloadExcel = async () => {
    setLoading(true)
    try {
      const data = await getRawDataForExport()

      const worksheet = XLSX.utils.json_to_sheet(data)
      
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Support Data")
      
      XLSX.writeFile(workbook, "Hosho_Support_Data.xlsx")
    } catch (error) {
      console.error("Export failed", error)
      alert("Failed to export Excel file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <p className="text-gray-500">Export raw data to build custom reports in Power BI or Excel.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Download the complete dataset including ticket creation times, status history, and customer satisfaction scores.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleDownloadCSV} 
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading ? 'Generating...' : 'Download CSV (For Power BI)'}
            </Button>

            <Button 
              onClick={handleDownloadExcel} 
              disabled={loading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Generating...' : 'Download Excel (.xlsx)'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Volume</h3>
            <p className="text-sm text-blue-700 mt-1">
              Includes all {loading ? '...' : 'active and closed'} tickets.
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 className="font-semibold text-green-900">CSAT Scores</h3>
            <p className="text-sm text-green-700 mt-1">
              Includes 1-5 star ratings and feedback text.
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <h3 className="font-semibold text-purple-900">Performance</h3>
            <p className="text-sm text-purple-700 mt-1">
              Includes timestamps for creation and resolution.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}