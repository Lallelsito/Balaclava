@echo off
title BALACLAVA - Lanzador
cd /d "%~dp0"
set "HTML_PATH=%~dp0www\index.html"
if not exist "%HTML_PATH%" set "HTML_PATH=%~dp0index.html"
echo Iniciando BALACLAVA...
start "" "%HTML_PATH%"
exit
