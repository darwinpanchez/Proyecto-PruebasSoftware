# PASO 2: Generador HTML desde JSON simplificado
param(
    [string]$JsonFile = "",
    [switch]$ProcessAll = $false
)

Write-Host "=== PASO 2: GENERAR HTML DESDE JSON ===" -ForegroundColor Green

function Create-Report {
    param([string]$JsonPath)
    
    if (!(Test-Path $JsonPath)) {
        Write-Host "ERROR: No encontrado: $JsonPath" -ForegroundColor Red
        return $false
    }
    
    $htmlFile = $JsonPath.Replace(".json", "-report.html")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $fileName = [System.IO.Path]::GetFileName($JsonPath)
    $fileSize = (Get-Item $JsonPath).Length / 1KB
    
    Write-Host "Procesando: $fileName" -ForegroundColor Cyan
    Write-Host "Generando HTML con datos reales..." -ForegroundColor Yellow
    
    # Determinar tipo de test
    $testType = "K6 Test"
    $testColor = "#3498db"
    $testDescription = "Prueba de rendimiento"
    
    if ($fileName -like "*load*") {
        $testType = "Load Test"
        $testColor = "#27ae60"
        $testDescription = "Prueba de Carga Gradual"
    } elseif ($fileName -like "*spike*") {
        $testType = "Spike Test"
        $testColor = "#e74c3c"
        $testDescription = "Prueba de Pico Subito"
    } elseif ($fileName -like "*soak*") {
        $testType = "Soak Test"
        $testColor = "#f39c12"
        $testDescription = "Prueba de Resistencia"
    }
    
    # Leer y procesar datos del JSON k6
    Write-Host "Analizando formato JSON k6..." -ForegroundColor Gray
    
    try {
        $jsonContent = Get-Content $JsonPath -Raw
        $jsonLines = Get-Content $JsonPath
        
        # Contadores para calcular métricas desde JSON k6
        $totalChecks = 0
        $passedChecks = 0
        $totalRequests = 0
        $failedRequests = 0
        $durations = @()
        $totalDataReceived = 0
        $totalIterations = 0
        $maxVUs = 0
        
        # Inicializar valores
        $checksRate = "N/A"
        $avgDuration = "N/A"
        $p95Duration = "N/A"
        $failedRate = "N/A"
        $reqPerSec = "N/A"
        $dataReceived = "N/A"
        $iterations = "N/A"
        $vusMax = "N/A"
        
        Write-Host "Procesando $($jsonLines.Count) líneas JSON k6..." -ForegroundColor Gray
        
        foreach ($line in $jsonLines) {
            if ($line.Trim() -eq "") { continue }
            
            try {
                $jsonObj = $line | ConvertFrom-Json
                
                # Extraer checks
                if ($jsonObj.metric -eq "checks" -and $jsonObj.type -eq "Point") {
                    $totalChecks++
                    if ($jsonObj.data.value -eq 1) { $passedChecks++ }
                }
                
                # Extraer requests HTTP
                if ($jsonObj.metric -eq "http_reqs" -and $jsonObj.type -eq "Point") {
                    $totalRequests++
                }
                
                # Extraer requests fallidos
                if ($jsonObj.metric -eq "http_req_failed" -and $jsonObj.type -eq "Point") {
                    if ($jsonObj.data.value -eq 1) { $failedRequests++ }
                }
                
                # Extraer duraciones HTTP
                if ($jsonObj.metric -eq "http_req_duration" -and $jsonObj.type -eq "Point") {
                    $durations += $jsonObj.data.value
                }
                
                # Extraer datos recibidos
                if ($jsonObj.metric -eq "data_received" -and $jsonObj.type -eq "Point") {
                    $totalDataReceived += $jsonObj.data.value
                }
                
                # Extraer iteraciones
                if ($jsonObj.metric -eq "iterations" -and $jsonObj.type -eq "Point") {
                    $totalIterations += $jsonObj.data.value
                }
                
                # Extraer VUs máximos
                if ($jsonObj.metric -eq "vus_max" -and $jsonObj.type -eq "Point") {
                    if ($jsonObj.data.value -gt $maxVUs) { $maxVUs = $jsonObj.data.value }
                }
                
            } catch {
                # Línea no es JSON válido, continuar silenciosamente
            }
        }
        
        # Calcular métricas finales
        if ($totalChecks -gt 0) {
            $checksRate = "$([math]::Round(($passedChecks / $totalChecks) * 100, 2))%"
        }
        
        if ($totalRequests -gt 0) {
            $failedRate = "$([math]::Round(($failedRequests / $totalRequests) * 100, 2))%"
        }
        
        if ($durations.Count -gt 0) {
            $sortedDurations = $durations | Sort-Object
            $avgDuration = "$([math]::Round(($durations | Measure-Object -Average).Average, 2))ms"
            $p95Index = [math]::Floor($durations.Count * 0.95)
            if ($p95Index -lt $sortedDurations.Count) {
                $p95Duration = "$([math]::Round($sortedDurations[$p95Index], 2))ms"
            }
        }
        
        if ($totalDataReceived -gt 0) {
            if ($totalDataReceived -gt 1024*1024) {
                $dataReceived = "$([math]::Round($totalDataReceived / (1024*1024), 2)) MB"
            } elseif ($totalDataReceived -gt 1024) {
                $dataReceived = "$([math]::Round($totalDataReceived / 1024, 2)) KB"
            } else {
                $dataReceived = "$totalDataReceived B"
            }
        }
        
        $iterations = $totalIterations.ToString()
        $vusMax = $maxVUs.ToString()
        
        # Calcular requests por segundo (estimación básica)
        if ($totalRequests -gt 0 -and $durations.Count -gt 0) {
            $maxDurationMs = ($durations | Measure-Object -Maximum).Maximum
            $testDurationSec = $maxDurationMs / 1000
            if ($testDurationSec -gt 0) {
                $reqPerSec = "$([math]::Round($totalRequests / $testDurationSec, 2))/s"
            }
        }
        
        Write-Host "✅ Métricas extraídas del JSON k6:" -ForegroundColor Green
        Write-Host "  • Checks: $checksRate ($passedChecks de $totalChecks)" -ForegroundColor Cyan
        Write-Host "  • HTTP Requests: $totalRequests total, $failedRequests fallidos" -ForegroundColor Cyan
        Write-Host "  • Duración P95: $p95Duration, Promedio: $avgDuration" -ForegroundColor Cyan
        Write-Host "  • VUs Máximos: $vusMax, Iteraciones: $iterations" -ForegroundColor Cyan
        Write-Host "  • Datos: $dataReceived, RPS estimado: $reqPerSec" -ForegroundColor Cyan
        
    } catch {
        Write-Host "⚠️ Error procesando JSON k6: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "Usando valores por defecto..." -ForegroundColor Gray
        # Los valores N/A ya están asignados por defecto
    }
    
    # HTML con datos reales extraídos del JSON (sin iconos)
    $html = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>$testType Report - Datos Reales</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, $testColor, #34495e); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; padding: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background: linear-gradient(45deg, #2c3e50, $testColor); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header h2 { margin: 15px 0; font-size: 1.4em; opacity: 0.9; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 25px; background: rgba(255,255,255,0.2); margin: 15px 0; font-weight: bold; }
        .content { padding: 30px; }
        .process-info { background: linear-gradient(45deg, #00b894, #00cec9); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0; }
        .metric-card { background: #f1f2f6; padding: 25px; border-radius: 12px; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .metric-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .metric-value { font-size: 2.2em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { color: #636e72; font-size: 1em; font-weight: 500; }
        .success { border-left: 6px solid #00b894; }
        .success .metric-value { color: #00b894; }
        .warning { border-left: 6px solid #f39c12; }
        .warning .metric-value { color: #f39c12; }
        .danger { border-left: 6px solid #e74c3c; }
        .danger .metric-value { color: #e74c3c; }
        .info { border-left: 6px solid #3498db; }
        .info .metric-value { color: #3498db; }
        .thresholds-section { background: #2d3436; color: white; padding: 30px; border-radius: 12px; margin: 25px 0; }
        .threshold-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #636e72; }
        .threshold-item:last-child { border-bottom: none; }
        .threshold-name { font-weight: 500; }
        .badge-pass { background: #00b894; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.85em; font-weight: bold; }
        .badge-fail { background: #e74c3c; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.85em; font-weight: bold; }
        .info-box { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid $testColor; }
        .json-link { display: inline-block; margin: 15px 0; padding: 15px 25px; background: $testColor; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: all 0.3s ease; }
        .json-link:hover { background: #2c3e50; }
        .command { background: #2d3436; color: #00cec9; padding: 15px; border-radius: 8px; font-family: 'Consolas', 'Monaco', monospace; margin: 10px 0; overflow-x: auto; font-size: 0.9em; }
        .footer { text-align: center; padding: 25px; background: #2d3436; color: white; }
        .results-highlight { background: linear-gradient(45deg, #6c5ce7, #a29bfe); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .data-extract-info { background: linear-gradient(45deg, #fd79a8, #fdcb6e); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        h3 { margin-top: 0; margin-bottom: 15px; }
        .performance-summary { background: #dff9fb; border: 2px solid #00cec9; padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reporte K6 Performance</h1>
            <h2>$testType Test</h2>
            <div class="status-badge">Datos Reales Extraidos del JSON</div>
            <p>$timestamp</p>
        </div>
        
        <div class="content">
            <div class="process-info">
                <h3>Proceso de 2 Pasos Completado Exitosamente</h3>
                <p><strong>PASO 1:</strong> k6 ejecuto el test y genero JSON con todas las metricas</p>
                <p><strong>PASO 2:</strong> Script PowerShell extrajo datos reales del JSON y genero este HTML</p>
                <p><strong>RESULTADO:</strong> Reporte visual con metricas reales de performance</p>
            </div>
            
            <div class="data-extract-info">
                <h3>Informacion de Extraccion de Datos</h3>
                <p><strong>Archivo JSON procesado:</strong> $fileName</p>
                <p><strong>Tamaño del archivo:</strong> $([math]::Round($fileSize, 2)) KB</p>
                <p><strong>Tipo de test:</strong> $testType</p>
                <p><strong>VUs Maximos detectados:</strong> $vusMax usuarios virtuales</p>
                <p><strong>Total de iteraciones:</strong> $iterations completadas</p>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card $(if($checksRate -like "*N/A*" -or ([decimal]($checksRate -replace '%','') -lt 99)) { 'danger' } else { 'success' })">>
                    <div class="metric-value">$checksRate</div>
                    <div class="metric-label">Checks Exitosos</div>
                </div>
                
                <div class="metric-card $(if($p95Duration -like "*ms" -and [decimal]($p95Duration -replace 'ms','') -gt 500) { 'danger' } elseif($p95Duration -like "*s" -and !($p95Duration -like "*ms") -and [decimal]($p95Duration -replace 's','') -gt 0.5) { 'danger' } else { 'success' })">>>>
                    <div class="metric-value">$p95Duration</div>
                    <div class="metric-label">P95 Tiempo de Respuesta</div>
                </div>
                
                <div class="metric-card $(if($failedRate -like "*N/A*" -or ([decimal]($failedRate -replace '%','') -gt 1)) { 'danger' } else { 'success' })">>
                    <div class="metric-value">$failedRate</div>
                    <div class="metric-label">Tasa de Fallos HTTP</div>
                </div>
                
                <div class="metric-card info">
                    <div class="metric-value">$avgDuration</div>
                    <div class="metric-label">Tiempo Promedio</div>
                </div>
                
                <div class="metric-card warning">
                    <div class="metric-value">$reqPerSec</div>
                    <div class="metric-label">Requests por Segundo</div>
                </div>
                
                <div class="metric-card info">
                    <div class="metric-value">$dataReceived</div>
                    <div class="metric-label">Datos Recibidos</div>
                </div>
            </div>
            
            <div class="thresholds-section">
                <h3>Evaluacion de Thresholds Empresariales</h3>
                
                <div class="threshold-item">
                    <span class="threshold-name"><strong>checks rate &gt; 99%:</strong> Validaciones exitosas</span>
                    <span class="$(if($checksRate -like "*N/A*" -or ([decimal]($checksRate -replace '%','') -lt 99)) { 'badge-fail' } else { 'badge-pass' })">$(if($checksRate -like "*N/A*" -or ([decimal]($checksRate -replace '%','') -lt 99)) { "FALLO" } else { "PASO" }) - $checksRate</span>
                </div>
                
                <div class="threshold-item">
                    <span class="threshold-name"><strong>http_req_duration p95 &lt; 500ms:</strong> Tiempo de respuesta</span>
                    <span class="$(if($p95Duration -like "*ms" -and ([decimal]($p95Duration -replace 'ms','') -gt 500)) { 'badge-fail' } else { 'badge-pass' })">$(if($p95Duration -like "*ms" -and ([decimal]($p95Duration -replace 'ms','') -gt 500)) { "FALLO" } else { "PASO" }) - $p95Duration</span>
                </div>
                
                <div class="threshold-item">
                    <span class="threshold-name"><strong>http_req_failed rate &lt; 1%:</strong> Tasa de errores</span>
                    <span class="$(if($failedRate -like "*N/A*" -or ([decimal]($failedRate -replace '%','') -gt 1)) { 'badge-fail' } else { 'badge-pass' })">$(if($failedRate -like "*N/A*" -or ([decimal]($failedRate -replace '%','') -gt 1)) { "FALLO" } else { "PASO" }) - $failedRate</span>
                </div>
            </div>
            
            <div class="performance-summary">
                <h3>Resumen de Performance Extraido del JSON</h3>
                <p><strong>Exito de Validaciones:</strong> $checksRate de todas las verificaciones pasaron</p>
                <p><strong>Tiempo de Respuesta P95:</strong> $p95Duration para el 95% de los requests</p>
                <p><strong>Tasa de Fallos:</strong> $failedRate de requests fallaron</p>
                <p><strong>Throughput:</strong> $reqPerSec de capacidad de procesamiento</p>
                <p><strong>Datos Transferidos:</strong> $dataReceived total procesado</p>
                <p><strong>Carga Maxima:</strong> $vusMax usuarios virtuales simultaneos</p>
                <p><strong>Iteraciones Completadas:</strong> $iterations ciclos de test</p>
            </div>
            
            <div class="results-highlight">
                <h3>Analisis Detallado del $testType Test</h3>
                <p>Los datos mostrados fueron extraidos directamente del archivo JSON generado por k6. Este reporte refleja las metricas reales de performance del backend de la tienda de tennis.</p>
                <p><strong>Tiempo promedio:</strong> $avgDuration por request</p>
                <p><strong>Capacidad:</strong> $reqPerSec requests procesados por segundo</p>
                <p><strong>Fiabilidad:</strong> $checksRate de validaciones exitosas</p>
                <p><strong>Escalabilidad:</strong> Probado con $vusMax usuarios simultaneos</p>
            </div>
            
            <div class="info-box">
                <h3>Acceso a Datos JSON Completos</h3>
                <p><strong>Archivo JSON con todas las metricas detalladas:</strong></p>
                <a href="$fileName" class="json-link" target="_blank">Abrir JSON Original: $fileName</a>
                
                <p><strong>Comandos PowerShell para analisis avanzado:</strong></p>
                <div class="command">Get-Content "$fileName" | ConvertFrom-Json | Select-Object -First 10</div>
                <div class="command">Get-Content "$fileName" | Where-Object { `$_ -like '*metric*' } | Select-Object -First 5</div>
                <div class="command">Get-Content "$fileName" | Where-Object { `$_ -like '*checks*' }</div>
            </div>
            
            <div class="info-box">
                <h3>Repetir el Proceso de 2 Pasos</h3>
                <p><strong>Para generar un nuevo JSON (Paso 1):</strong></p>
                <div class="command">.\step1-json.ps1 $($testType.ToLower().Replace(' ', '-').Replace('test', '-test'))</div>
                
                <p><strong>Para convertir JSON a HTML (Paso 2):</strong></p>
                <div class="command">.\step2-html.ps1 -JsonFile "$fileName"</div>
                
                <p><strong>Para procesar todos los JSON existentes:</strong></p>
                <div class="command">.\step2-html.ps1 -ProcessAll</div>
                
                <p><strong>Para usar los scripts completos con manejo de errores:</strong></p>
                <div class="command">.\generate-json.ps1</div>
                <div class="command">.\generate-html.ps1</div>
            </div>
        </div>
        
        <div class="footer">
            <p>JSON procesado a HTML con datos reales | K6 Performance Testing | Tienda Tennis Backend</p>
            <p>Generado el $timestamp</p>
        </div>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $htmlFile -Encoding UTF8
    
    Write-Host "✅ HTML generado: $htmlFile" -ForegroundColor Green
    return $true
}

# Procesar archivos
if ($ProcessAll) {
    $jsonFiles = Get-ChildItem -Path "reports" -Filter "*.json" -ErrorAction SilentlyContinue
    if ($jsonFiles.Count -eq 0) {
        Write-Host "❌ No hay archivos JSON en reports/" -ForegroundColor Red
    } else {
        Write-Host "📄 Procesando $($jsonFiles.Count) archivos JSON..." -ForegroundColor Yellow
        foreach ($file in $jsonFiles) {
            Create-Report -JsonPath $file.FullName | Out-Null
        }
        Write-Host "✅ Todos los archivos procesados" -ForegroundColor Green
    }
} elseif ($JsonFile -ne "") {
    Create-Report -JsonPath $JsonFile | Out-Null
} else {
    Write-Host "❌ Falta parámetro JsonFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\step2-html.ps1 -JsonFile 'archivo.json'" -ForegroundColor Cyan
    Write-Host "  .\step2-html.ps1 -ProcessAll" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Archivos JSON disponibles:" -ForegroundColor Gray
    $jsonFiles = Get-ChildItem -Path "reports" -Filter "*.json" -ErrorAction SilentlyContinue
    foreach ($file in $jsonFiles) {
        Write-Host "  📄 $($file.Name)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=== PASO 2 COMPLETADO ===" -ForegroundColor Green
