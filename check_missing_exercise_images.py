# Script para detectar imágenes de ejercicios faltantes
import json
import os

# Ruta al JSON y a la carpeta de imágenes
json_path = './src/data/ejercicios.json'
imagenes_path = './public/ejercicios/'

with open(json_path, encoding='utf-8') as f:
    ejercicios = json.load(f)

imagenes = set(os.listdir(imagenes_path))

faltantes = []
for ej in ejercicios:
    img = ej.get('imagen', '').strip()
    if img and img not in imagenes:
        faltantes.append(f"{ej['nombre']} => {img}")

if faltantes:
    print('Imágenes faltantes:')
    for f in faltantes:
        print(f)
else:
    print('Todas las imágenes referenciadas existen.')
