        function renderHeatmap(heatmap) {
            const container = document.getElementById('heatmap-container');
            container.innerHTML = ''; 
            const last7 = getLast7Dates(); 
            const dateToHeatmap = {}; 
            (heatmap || []).forEach(h => { if (h.date) dateToHeatmap[h.date] = h; });

            // UTC offset math
            const localOffset = new Date().getTimezoneOffset();
            const hourShift = useLocalTime ? Math.round(-localOffset / 60) : 0; 

            last7.forEach(date => {
                const dayData = dateToHeatmap[date] || { success: {}, fail: {} };
                const dayCol = document.createElement('div'); 
                dayCol.className = 'flex-1 flex flex-col gap-[2px] h-full';
                
                for (let hour = 0; hour < 24; hour++) {
                    const hourRow = document.createElement('div');
                    hourRow.className = 'flex-1 flex flex-row gap-[1px]';
                    
                    for (let min = 0; min < 60; min += 15) {
                        // Source data is PST (UTC-8). 
                        // To show UTC (hourShift=0), we need to add 8 hours.
                        // To show Local, we need to add (8 + localOffset/60).
                        let sourceHour = (hour - (hourShift + 8) + 24) % 24;
                        const hStr = sourceHour.toString().padStart(2, '0');
                        const mStr = min.toString().padStart(2, '0');
                        const key = `${hStr}:${mStr}`;
                        
                        const s = parseInt(dayData.success[key] || 0);
                        const f = parseInt(dayData.fail[key] || 0);
                        const cell = document.createElement('div');
                        
                        let color = 'bg-slate-800/20';
                        if (f > 0) { color = 'bg-red-500'; if (s > 0) color = 'bg-orange-500'; }
                        else if (s > 0) { color = 'bg-emerald-400'; }
                        
                        cell.className = `flex-1 h-full rounded-[1px] ${color}`;
                        const displayHour = hour.toString().padStart(2, '0');
                        cell.title = `${date} ${displayHour}:${mStr} - Success: ${s}, Fail: ${f}`;
                        hourRow.appendChild(cell);
                    }
                    dayCol.appendChild(hourRow);
                }
                container.appendChild(dayCol);
            });
        }