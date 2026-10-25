# Microsonidos

Siete efectos cortos para la interfaz. Todos salen del pack Interface Sounds 1.0 de
Kenney, que es CC0-1.0 (dominio público). El texto de la licencia está en
`LICENSE-kenney.txt`, copiado tal cual del pack.

| Archivo | Uso | Archivo original en el pack | Duración audible del original |
| --- | --- | --- | --- |
| `paid.mp3` | marcar a alguien como pagado | `kenney_interface/Audio/glass_001.ogg` | 0,173 s |
| `picked.mp3` | platos recogidos | `kenney_interface/Audio/drop_003.ogg` | 0,065 s |
| `paste.mp3` | chat pegado que entra al registro | `kenney_interface/Audio/select_005.ogg` | 0,170 s |
| `copy.mp3` | recordatorio copiado | `kenney_interface/Audio/click_001.ogg` | 0,013 s |
| `undo.mp3` | deshacer | `kenney_interface/Audio/back_002.ogg` | 0,054 s |
| `goal.mp3` | llegar al 100 % de la meta | `kenney_interface/Audio/confirmation_004.ogg` | 0,460 s |
| `toggle.mp3` | cambio de idioma y chips de filtro | `kenney_interface/Audio/select_001.ogg` | 0,031 s |

Se eligieron por medición (duración, brillo, peso en graves y cresta, con
`sfx_lib.py` del skill hackathon-video) y por el nombre del archivo, sin
escucharlos. Conviene oírlos en la app antes de darlos por buenos.

Están pasados a mp3 mono de 44,1 kHz a 64 kbps, con un fundido corto al final. La
ganancia se fijó para que el RMS de la parte audible quede en -26 dBFS sin que el
pico pase de -6 dBFS. En la práctica los picos quedaron entre -11 y -17 dBFS. Cada
archivo pesa menos de 5 KB.

Se generaron con:

```
python ~/.claude/biblioteca-sonora/scripts/sonora.py instalar ki-glass_001 public/sfx/paid.mp3 --recorte 0.3
```

y lo mismo para los demás, con el id `ki-<nombre del original>`.
