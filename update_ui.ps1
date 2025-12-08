$filePath = "c:\Users\rodav\Desktop\progetto istat\src\app\page.tsx"
$content = Get-Content $filePath -Raw

# Find the start of the return statement
$returnPattern = '  return \(\r?\n    <div className="flex h-screen bg-\[#f8f9fa\]'
$startMatch = [regex]::Match($content, $returnPattern)

if ($startMatch.Success) {
    $startIndex = $startMatch.Index
    
    # Find the closing of the function (last closing brace before EOF)
    $endPattern = '\r?\n\}\r?\n$'
    $endMatch = [regex]::Match($content, $endPattern)
    
    if ($endMatch.Success) {
        # Get the content before the return
        $beforeReturn = $content.Substring(0, $startIndex)
        
        # New UI content
        $newUI = @'
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Titolo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-200">
                  R
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">ROSS 1000</h1>
                  <p className="text-xs text-slate-500">Validazione File TXT/XML</p>
                </div>
              </div>
            </div>

            {/* Azioni Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 border-slate-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Upload Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-400 transition-all duration-300 p-8 relative group cursor-pointer hover:shadow-lg">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Carica File</h3>
                <p className="text-sm text-slate-500 mb-4">Trascina qui o clicca per caricare file TXT o XML</p>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.xml"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{records.length}</div>
              <div className="text-sm text-slate-500">Record Totali</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {Object.values(validationErrors).reduce((total, errors) => total + errors.length, 0)}
              </div>
              <div className="text-sm text-slate-500">Errori Rilevati</div>
            </div>
          </div>
        </div>

        {/* Errors Alert */}
        {errors.length > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table Section */}
        {records.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FileText className="h-4 w-4" />
                    {records.length} record totali
                  </span>
                  {Object.values(validationErrors).some(errors => errors.length > 0) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      {Object.values(validationErrors).reduce((total, errors) => total + errors.length, 0)} errori
                    </span>
                  )}
                  {Object.values(advancedValidation).some(v => v.hasWarnings) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      {Object.values(advancedValidation).reduce((total, v) => total + v.warnings.length, 0)} avvertimenti
                    </span>
                  )}
                </div>

                {/* Download Button */}
                <div className="flex items-center gap-2">
                  {activeTab === 'valid' && (
                    <Button
                      onClick={() => generateTxtFile(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-200 hover:shadow-xl transition-all"
                      disabled={records.filter((_, index) => !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0).length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Scarica TXT Valido
                    </Button>
                  )}
                  {activeTab === 'invalid' && (
                    <Button
                      onClick={() => generateTxtFile(false)}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      disabled={records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Scarica TXT Non Valido
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'valid' | 'invalid')}>
              <div className="px-6 border-b border-slate-200">
                <TabsList className="h-12 bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="valid"
                    className="relative h-12 px-6 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:text-teal-600 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record Validi ({records.filter((_, index) => !hasMissingRequiredFields(index) && (validationErrors[index] || []).length === 0).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="invalid"
                    className="relative h-12 px-6 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:text-red-600 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Record Non Validi ({records.filter((_, index) => hasMissingRequiredFields(index) || (validationErrors[index] || []).length > 0).length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="valid" className="m-0">
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                          <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-teal-400/30 sticky left-0 z-30 bg-gradient-to-r from-teal-500 to-teal-600" style={{ minWidth: '60px' }}>
                            #
                          </th>
                          {ROSS_FIELDS.map(field => {
                            const getWidth = () => {
                              if (field.id === 3) return 60;
                              if (field.id === 4) return 60;
                              if (field.id === 14) return 60;
                              if (field.id === 15) return 60;
                              if (field.id === 16) return 60;
                              if (field.id === 17) return 60;
                              if (field.id === 1) return 130;
                              if (field.id === 5) return 70;
                              if (field.id === 19 || field.id === 20) return 150;
                              if (field.id === 24) return 60;
                              if (field.id === 26) return 110;
                              if ([2, 6, 7, 9, 10, 11, 13, 18].includes(field.id)) return 110;
                              return Math.max(field.length * 8, 90);
                            }
                            return (
                              <th
                                key={field.id}
                                className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-teal-400/30 whitespace-nowrap"
                                style={{ minWidth: getWidth() + 'px' }}
                              >
                                {field.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((_, recordIndex) => {
                          const hasMissingRequired = hasMissingRequiredFields(recordIndex)
                          const hasErrors = (validationErrors[recordIndex] || []).length > 0
                          const advancedResult = advancedValidation[recordIndex]

                          if (hasMissingRequired || hasErrors) return null

                          return (
                            <tr
                              key={recordIndex}
                              className="hover:bg-teal-50/50 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-slate-600 border-r border-slate-100 sticky left-0 z-10 bg-white" style={{ minWidth: '60px' }}>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
                                    {recordIndex + 1}
                                  </span>
                                  {advancedResult?.hasWarnings && (
                                    <div className="w-2 h-2 bg-amber-400 rounded-full" title="Avvertimenti"></div>
                                  )}
                                </div>
                              </td>
                              {ROSS_FIELDS.map(field => renderFieldCell(recordIndex, field.id))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="invalid" className="m-0">
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                          <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-red-400/30 sticky left-0 z-30 bg-gradient-to-r from-red-500 to-red-600" style={{ minWidth: '60px' }}>
                            #
                          </th>
                          {ROSS_FIELDS.map(field => {
                            const getWidth = () => {
                              if (field.id === 3) return 60;
                              if (field.id === 4) return 60;
                              if (field.id === 14) return 60;
                              if (field.id === 15) return 60;
                              if (field.id === 16) return 60;
                              if (field.id === 17) return 60;
                              if (field.id === 1) return 130;
                              if (field.id === 5) return 70;
                              if (field.id === 19 || field.id === 20) return 150;
                              if (field.id === 24) return 60;
                              if (field.id === 26) return 110;
                              if ([2, 6, 7, 9, 10, 11, 13, 18].includes(field.id)) return 110;
                              return Math.max(field.length * 8, 90);
                            }
                            return (
                              <th
                                key={field.id}
                                className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border-r border-red-400/30 whitespace-nowrap"
                                style={{ minWidth: getWidth() + 'px' }}
                              >
                                {field.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((_, recordIndex) => {
                          const hasMissingRequired = hasMissingRequiredFields(recordIndex)
                          const hasErrors = (validationErrors[recordIndex] || []).length > 0
                          const advancedResult = advancedValidation[recordIndex]

                          if (!hasMissingRequired && !hasErrors) return null

                          return (
                            <tr
                              key={recordIndex}
                              className="hover:bg-red-50/50 transition-colors bg-red-50/30"
                            >
                              <td className="px-4 py-3 font-medium text-slate-600 border-r border-slate-100 sticky left-0 z-10 bg-red-50/30" style={{ minWidth: '60px' }}>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                    {recordIndex + 1}
                                  </span>
                                  {advancedResult?.hasWarnings && (
                                    <div className="w-2 h-2 bg-amber-400 rounded-full" title="Avvertimenti"></div>
                                  )}
                                </div>
                              </td>
                              {ROSS_FIELDS.map(field => renderFieldCell(recordIndex, field.id))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Elaborazione file in corso...</p>
          </div>
        )}

        {/* Empty State */}
        {!isProcessing && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nessun file caricato</h3>
            <p className="text-slate-500 max-w-md">
              Carica un file TXT o XML per iniziare la validazione dei dati ROSS 1000
            </p>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-[380px] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                R
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Accedi per inviare
              </h3>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Regione
                </label>
                <select
                  value={loginCredentials.regione}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, regione: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                >
                  {regioni.map((regione) => (
                    <option key={regione.value} value={regione.value}>
                      {regione.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginCredentials.email}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="email@hotel.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg shadow-teal-200"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
'@

        # Combine the parts
        $newContent = $beforeReturn + $newUI
        
        # Write the new content
        Set-Content -Path $filePath -Value $newContent -NoNewline
        
        Write-Host "UI successfully replaced!"
    }
    else {
        Write-Host "Could not find end of function"
    }
}
else {
    Write-Host "Could not find return statement"
}
