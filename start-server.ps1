# PowerShell script to start a simple HTTP server for the College Email Organizer

# Define the port to use
$port = 8080

# Get the current directory
$directory = Get-Location

# Create a simple HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "College Email Organizer server started at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested URL
        $requestUrl = $request.Url.LocalPath
        $requestUrl = $requestUrl.TrimStart('/')
        
        # If no file is specified, serve index.html
        if ($requestUrl -eq "") {
            $requestUrl = "index.html"
        }
        
        # Construct the file path
        $filePath = Join-Path -Path $directory -ChildPath $requestUrl
        
        # Check if the file exists
        if (Test-Path $filePath -PathType Leaf) {
            # Determine content type based on file extension
            $contentType = "text/plain"
            switch ([System.IO.Path]::GetExtension($filePath)) {
                ".html" { $contentType = "text/html" }
                ".css"  { $contentType = "text/css" }
                ".js"   { $contentType = "application/javascript" }
                ".json" { $contentType = "application/json" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".gif"  { $contentType = "image/gif" }
                ".svg"  { $contentType = "image/svg+xml" }
            }
            
            # Read the file content
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set response headers
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            
            # Write the content to the response output stream
            $output = $response.OutputStream
            $output.Write($content, 0, $content.Length)
            $output.Close()
        }
        else {
            # File not found
            $response.StatusCode = 404
            $response.Close()
        }
    }
}
finally {
    # Stop the listener when done
    $listener.Stop()
}