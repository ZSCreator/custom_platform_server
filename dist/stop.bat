@echo off






for /f "tokens=2" %%a in ('tasklist ^|find /i "node.exe"') do (
    echo %%a
    tskill  %%a
)


REM for /f "tokens=2" %%a in ('tasklist ^|find /i "node.exe"') do tskill  %%a

echo "all node killed"

