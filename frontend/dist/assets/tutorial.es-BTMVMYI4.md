# Tutorial

Este tutorial se ha traducido con ChatGPT, así que probablemente contiene errores.  
Los tutoriales en inglés y francés se han escrito a mano, así que, si puedes, es mejor usar uno de esos.

**Dofus Minmax** es una aplicación que calcula los mejores builds en Dofus.  
Está dividida en 3 secciones:

- **Pesos / Min / Max (parámetros)**: define qué quieres en tu build.
- **Selección de objetos**: selecciona los objetos que se incluirán en el cálculo de combinaciones.
- **Resultados de los builds**: muestra las mejores combinaciones de objetos calculadas.

La idea es que, al seleccionar solo los objetos más interesantes para las características que quieres, se vuelve posible calcular todas las combinaciones y encontrar las mejores.

Mi objetivo es que esta aplicación sea lo más completa posible, pero también quiero que los jugadores más casuales puedan usarla. Así que aquí va el:

## TL;DR

- Haz clic en el peso de las características que quieres en tu build
- Indica tu nivel
- Haz clic en **«Calcular los mejores objetos»**
- Haz clic en **«Selección rápida»**
- Añade los exos de PA / PM / Alcance si hace falta
- Haz clic en **«Calcular los mejores builds»**… y espera
- Compara los resultados
- Repite si hace falta hasta que quedes satisfecho

Recomiendo usar **Firefox** porque el cálculo de los mejores builds es un 30 % más rápido que en Chrome.

---

# Uso básico

## Parámetros de Pesos / Min / Max

Los pesos sirven para calcular el valor de los objetos, de los **sets** y de los builds.  
Cada característica se multiplica por su peso (0 si el peso no está definido) para obtener el valor final.

Solo se tienen en cuenta los valores máximos posibles de las características de los objetos.  
Las características derivadas como placaje, huida, iniciativa… se calculan para cada objeto y set al cargar la aplicación. Esto significa que solo deberías poner peso en una característica si valoras su efecto base, no sus efectos derivados.  
Por ejemplo, no pongas peso en **Sabiduría** salvo que te interese el bonus de experiencia que da. Poner peso en una característica derivada ya afecta de rebote a su característica de origen.

**Min** es un límite estricto: si la característica final de un build está por debajo del valor que has puesto, se ignora (y el valor del build pasa a ser 0).  
**Max** es un límite flexible: si una característica supera el valor Max, se limita (se “cappea”) a ese valor, lo que reduce de forma natural su contribución al valor del build.

Haz clic en el peso de las características para añadir el valor por defecto. Ajusta si tienes una idea de lo que quieres. Si no, siempre podrás volver más tarde y cambiarlo. También puedes quitar un peso haciendo doble clic sobre él.

Los parámetros **Min** de **PA, PM y Alcance** son los más importantes si ya sabes qué quieres.

Una vez que tengas tus pesos y límites Min / Max definidos, haz clic en **«Calcular los mejores objetos»**. No olvides definir también el nivel deseado.

---

## Selección de objetos

Toda la base de datos de objetos y **sets** se usa como referencia cada vez que haces clic en **«Calcular los mejores objetos»**.

Los objetos con el valor más alto para cada categoría se muestran en la primera columna.  
Si un objeto forma parte de un set, también mostrará el valor **«Con set»**.  
Al pasar el ratón por encima de un objeto se muestran sus detalles.  
Si haces clic en un objeto, se añade a la selección.

Si un objeto está por debajo del nivel deseado, se ignora.  
Si un objeto tiene una condición, esta no afecta a su valor. Sin embargo, si una condición de PA / PM es incompatible con un parámetro Min, el objeto se ignora.  
Por ejemplo, definir 11 PA en Min hará que se ignoren los objetos con PA < 11. Definir 12 PA y 6 PM hará que se ignoren los objetos con PA < 12 o PM < 6.

Los efectos especiales de los objetos no afectan a su valor. Puede ser necesario **bloquear** un objeto para conseguir resultados que lo usen si buena parte de su valor proviene de un efecto especial.

Los **sets** con la puntuación más alta (función explicada más abajo) se muestran en la segunda columna.  
Al pasar el ratón por encima de un set se muestran sus bonus y el valor que aporta para cada número de objetos equipados. Los valores que se muestran son incrementales: indican el valor añadido por cada objeto adicional.

Los **20 mejores sets** se muestran por defecto.  
Si seleccionas un objeto que pertenece a un set fuera del top 20, ese set se mostrará igualmente al final de la columna.  
Si haces clic en **«Seleccionadas»** junto al top 20, solo se mostrarán los sets que contienen al menos un objeto seleccionado.

La tercera columna muestra los objetos seleccionados por categoría. Se probarán todas las combinaciones posibles dentro de esta selección.  
Al final de esta columna se muestra el número total de combinaciones, así como el tiempo estimado para calcularlas (K = mil, M = millón, B = millardo/mil millones, T = trillón).

El icono del ojo desplaza la vista automáticamente hasta el objeto correspondiente en las otras columnas.

Cada objeto puede **bloquearse**, lo que obliga a que esté presente en todas las combinaciones a calcular. Esto puede reducir muchísimo el número de combinaciones. Solo se puede bloquear un objeto por categoría (dos para anillos, seis para Dofus).

La idea es seleccionar tantos objetos y sets interesantes como puedas, pero manteniendo un número razonable de combinaciones.

Hay dos enfoques:

- Usar **«Selección rápida»**: añade todos los objetos visibles de los sets visibles + el objeto con mayor valor por categoría (sin contar Dofus/Trofeos). Es más rápido pero puede ser menos óptimo.
- Seleccionar a mano los objetos y sets que te parezcan relevantes.

Después, revisa el total de combinaciones. Quita los sets menos buenos si el número es demasiado alto. Intenta mantenerlo por debajo de **100 millones** para una primera prueba. No hay ningún problema especial en calcular un número enorme de combinaciones: simplemente tardará más y hará trabajar más tu PC.

Al final de la primera columna, indica si tienes pensado llevar exos de PA/PM/Alcance en tu build.

Luego haz clic en **«Calcular los mejores builds»**.

Mientras se hace el cálculo, se muestra el progreso y la velocidad.  
Puedes guardar la velocidad de cálculo para estimar con más precisión cálculos futuros.

Cuando termine, los resultados aparecerán en la sección de **Builds**.

---

## Builds

Se muestran los **500 mejores resultados**, ordenados por valor. Si ningún resultado cumple los parámetros Min u otras condiciones, la lista estará vacía.

Si una característica y su peso son ambos 0, esa característica no se muestra.  
Si una característica es distinta de 0 pero su peso es 0, se muestra con baja opacidad, indicando que su valor no influye en el build.

Las características se agrupan en 3 grupos: **Utilidad**, **Ofensivo** y **Defensivo**.  
El valor de las características de cada grupo se suma y se muestra arriba de cada grupo.

Si una característica supera su parámetro Max, se “cappa”; una flecha gris indica el valor original.  
Si una característica está por debajo de su parámetro Min, se muestra en rojo y el valor del build pasa a 0.

Una de las funciones principales de esta sección es **comparar un build**.  
Los demás builds mostrarán las diferencias con respecto al build que estés comparando. Para cada build se muestran las diferencias de:

- Valor del build
- Valor de cada grupo de características
- Características
- Objetos
- Sets

Las condiciones del build aparecen debajo de las características. Si una condición queda incluida dentro de otra, se fusionan.  
Ejemplo: **PA < 11** y **PA < 10** se convierte simplemente en **PA < 10**.

Si un build no respeta una condición de: **Vitalidad, Fuerza, Suerte, Inteligencia, Agilidad, Sabiduría** → la condición se muestra con fondo amarillo.  
Si no respeta una condición de: **Nivel** o **bonus de set < 3** → la condición se muestra con fondo rojo y valor = 0.  
Todas las demás condiciones (PA, PM, [PA o PM], Alcance, Invocaciones) se comportan como un parámetro Max: la característica se “cappa”.

Puedes exportar un build a **DofusDB** o **DofusBook**.

Los 500 builds se recalculan dinámicamente si cambias los parámetros de pesos o Min/Max, el nivel o los exos.  
Un parámetro Min más estricto puede volver inválidos algunos builds y poner su valor a 0, lo que hará que bajen al fondo de la lista.

Esta funcionalidad permite evitar recalcular combinaciones enormes cada vez que haces un pequeño ajuste.  
Ojo: si cambias mucho los parámetros, puede hacer falta recalcular los mejores objetos, ya que podrían existir objetos más relevantes o combinarse mejor en nuevos builds.

---

## Navegación

Cada columna tiene su propia zona de scroll. Al pasar el ratón por encima de una columna, el scroll principal se sustituye por el de esa columna.  
Para hacer scroll en la página, aparta el ratón de las columnas o usa la barra de navegación de la izquierda.

Los tooltips de objetos/sets pasan a ser desplazables cuando son demasiado grandes. En ese caso, el scroll actúa sobre el tooltip, no sobre la página.

En los resultados, usa **↑ ↓** para navegar rápido y **← →** para cambiar de página.

---

# Builds guardados

Puedes guardar un build. Aparecen en la sección de builds, junto a **«Resultados»**.  
Igual que los resultados, sus valores se actualizan dinámicamente según los parámetros.

Si un build guardado es idéntico a un resultado de una nueva búsqueda, recupera su nombre guardado.

También puedes elegir un build guardado como referencia para compararlo con los demás.

---

# Búsquedas guardadas

Todos los parámetros de la búsqueda se codifican en la URL.  
Así que puedes copiar la URL, pegarla en otra pestaña y modificarla para comparar dos búsquedas.

Los builds guardados se sincronizan entre tus pestañas.  
Así puedes hacer una variante de una búsqueda en una segunda pestaña, guardar un build y luego compararlo en la primera pestaña.

Puedes guardar una búsqueda en la barra superior. Ponle un nombre (por ejemplo: **«Panda tank»**). El título de la página se actualiza con ese nombre.  
Si modificas tu búsqueda, el texto se vuelve naranja. Vuelve a guardarla para que vuelva a estar en verde.

Para cargar una búsqueda, haz clic en el nombre de la búsqueda arriba a la izquierda para mostrar todas las búsquedas guardadas.  
Al cargar la página, si la URL coincide exactamente con una búsqueda guardada, se carga automáticamente.

**Ojo:** las búsquedas y builds guardados se almacenan solo en el almacenamiento local del navegador. Se pueden perder si lo vacías.

Para evitar perder una búsqueda: guarda la URL en tus favoritos.  
Para evitar perder un build: expórtalo a tu web de Dofus favorita. También puedes exportar un build como nueva búsqueda y guardar su URL en tus favoritos.

La búsqueda se guarda en el historial de tu navegador cuando:

- Haces clic en **«Calcular los mejores objetos»** o **«Calcular los mejores builds»**
- Creas, cargas, guardas o compartes una búsqueda

Puedes volver a una versión anterior de tu búsqueda navegando por el historial. Esto conserva los resultados de una búsqueda.

---

# Sets

## Valor por objeto

Para calcular el valor que un set aporta a un objeto, se calcula el valor de cada bonus y luego se divide por el número de objetos necesarios para conseguirlo. Se conserva el mejor valor por objeto.  
Este valor se muestra como **«Mejor valor por objeto»** y se añade a cada objeto del set.

En la mayoría de los casos, este valor máximo corresponde al set completo, pero a veces un escalón intermedio puede ofrecer una mejor media.

## Puntuación

Para calcular los mejores sets, se usa una función de puntuación. No es obligatorio entenderla, pero aquí va la explicación:

Para cada objeto del set, se calcula la diferencia de valor entre ese objeto y el mejor objeto de su categoría. Eso representa el valor que pierdes por no usar el mejor objeto posible. Estas pérdidas se ordenan de mayor a menor.  
Para cada bonus de set, se calcula el valor del bonus menos el valor perdido por los X primeros objetos necesarios, y luego se divide por el número total de objetos del set. Se conserva el mejor valor obtenido. Ese es el score final.

La idea es clasificar los sets según el valor máximo que pueden aportar, teniendo en cuenta la pérdida potencial por no equipar los mejores objetos de cada categoría.

Un score negativo no significa necesariamente que un set sea malo: puede ser imprescindible para cumplir un parámetro Min (a menudo los PA), evitar llegar a un parámetro Max o cumplir una condición.

Un punto débil de esta función de puntuación es que el mejor objeto de una categoría puede ser demasiado caro o no ser lo que buscas. En esos casos, un set que contenga un objeto de esa categoría podría quedar mal posicionado, aunque sea muy relevante.

No hay que tomar esta función de puntuación como una verdad absoluta. Puede ser necesario añadir sets con un score más bajo, o quitar sets que no tengan sentido según lo que estés buscando.

## Sets parcialmente seleccionables

Si un set contiene un objeto no seleccionable porque:

- Un objeto supera tu nivel
- Un objeto con prerequisito es incompatible con los parámetros Min
- Un objeto pertenece a una categoría que ya está bloqueada

Las funciones de valor por objeto y de puntuación tienen esto en cuenta: solo se conservan las combinaciones posibles.

Si solo una pieza (o ninguna) se puede seleccionar, el score pasa a **−Infinito** y el set no se muestra.

Después de bloquear un objeto, puede ser útil recalcular los mejores objetos para obtener scores actualizados. Eso te indica:  
«Dado lo que has bloqueado, estos son los mejores objetos y sets que encajan en los huecos restantes».  
Puedes incluso usar este método para construir un build bloqueando poco a poco objetos o sets y recalculando los mejores objetos en cada paso.

## Selección rápida

La **selección rápida** añade todos los objetos visibles de los sets visibles. Si un objeto no se puede seleccionar (nivel o Min incompatible), no se añade.

Puedes ajustar cuántos sets se muestran (**Top 20**) para añadir más o menos objetos.

La selección rápida también añade el objeto con el valor más alto de cada categoría (2 en el caso de anillos).  
La lógica es: si ese objeto es el mejor de su categoría fuera de set, elegir otro en principio aporta menos valor. Obviamente, si las características de un objeto interactúan con valores cappeados, eso puede tener un impacto importante. Pero como se trata de una selección **rápida**, es buena idea revisar qué objetos se han añadido y sumar otros si quieres resultados más finos.

## Set Momore

El **set Momore** es el único set con condiciones. Funciona igual que las condiciones de los objetos:  
Si tus parámetros Min de PM / Alcance / Invocaciones son incompatibles con el bonus de set, las funciones de score y valor por objeto lo tendrán en cuenta y excluirán las combinaciones afectadas.

Si no, el valor final del build se “cappa” según el bonus de set.  
Si quieres comparar builds que llevan este set, se recomienda poner un peso bajo o nulo a las características cappeadas por el set.

---

# Dofus / Trofeos

Los **Dofus** y **Trofeos** pueden incluirse en los cálculos de combinaciones.  
Su utilidad principal es evaluar builds influenciados por características que suelen estar cappeadas de forma natural (**Ocre, Vulbis, Sylvestre…**).

## Combinaciones

Es posible calcular varias combinaciones, pero ojo: el número crece de forma exponencial y normalmente aporta poco interés, salvo que tengas una necesidad concreta.  
Es recomendable, y más sencillo, mantener una sola combinación de Dofus / Trofeos por búsqueda.

- Selección ≤ 6 → 1 combinación
- 7 seleccionados → 7 combinaciones
- 8 seleccionados → 28 combinaciones
- 9 seleccionados → 84 combinaciones

Una posible forma de usarlo es comparar diferentes resultados cuando dudas sobre el último o los dos últimos huecos disponibles.  
Para eso, tienes que bloquear los Dofus / Trofeos que tengas claros y dejar sin bloquear los pocos sobre los que dudas.

Por ejemplo, puedes bloquear 5 Dofus / Trofeos y dejar **Hiperactivo** (+1 PA, −1 PM) y otro trofeo útil para tu build sin bloquear.  
Eso generaría solo 2 combinaciones, permitiéndote comparar fácilmente los resultados con y sin Hiperactivo en una sola búsqueda.

## Trofeos con bonus de set < 3

Si seleccionas al menos un Trofeo con prerequisito de **bonus de set < 3**, se crean dos grupos de combinaciones:

- **Grupo 1**: solo Dofus/Trofeos “clásicos”
- **Grupo 2**: los Trofeos **«bonus set < 3»** tienen prioridad

La idea es comparar builds que tienen la condición **«bonus de set < 3»** con builds que no la tienen.  
Un build con una condición tan restrictiva suele ser menos óptimo. Tiene sentido querer meter tantos Trofeos **«bonus set < 3»** como sea posible en un build: tienden a tener más valor.

El primer grupo, “clásico”, corresponde a combinaciones de Dofus / Trofeos **sin** los Trofeos con bonus de set < 3.  
Puede estar vacío si solo has seleccionado Trofeos bonus set < 3.

El segundo grupo, con bonus de set < 3, se crea así:

1. Primero, se seleccionan los Dofus / Trofeos “clásicos” bloqueados.
2. Luego:
    - Si hay tantos (o más) Trofeos bonus set < 3 como huecos restantes ⇒ se crean combinaciones **solo** con ellos ⇒ Terminado.
    - Si no, se rellenan los huecos con todos los Trofeos bonus set < 3.
3. Después, si quedan huecos libres y existen Trofeos clásicos sin bloquear ⇒ se crean combinaciones con estos en los huecos restantes ⇒ Terminado.

La forma más sencilla de gestionar estos dos grupos es tener una sola combinación (6 objetos) para cada grupo.  
Para hacerlo, selecciona 6 Dofus / Trofeos “clásicos”, bloquea los que quieras usar siempre y luego selecciona **[6 − Dofus / Trofeos clásicos bloqueados]** Trofeos bonus de set < 3.  
Por ejemplo, si seleccionas 6 Trofeos clásicos de los cuales 2 están bloqueados, añade 4 Trofeos bonus de set < 3.

Si quieres hacer combinaciones más complejas, empieza seleccionando solo Dofus / Trofeos y observa el número de combinaciones.  
También puedes calcular los mejores builds usando solo esos, sin ningún otro objeto, para comprobar que las combinaciones generadas son lo que esperas (quita entonces todos los parámetros Min para obtener resultados).

Este sistema de agrupación **no** se aplica si bloqueas al menos un Trofeo bonus de set < 3.  
En ese caso, todas las combinaciones se calculan de forma normal.  
Así que, si solo quieres explorar builds con esta condición, bloquea un Trofeo bonus de set < 3. Probablemente sea más sencillo si este mecanismo de agrupación te resulta lioso (lo cual se entiende).

---

# Cómo definir buenos parámetros

## Pesos

Los pesos por defecto vienen principalmente de su coste en **puits**, y luego ajustados cuando parecían demasiado altos o demasiado bajos.  
He comparado los familiares y las runas de trascendencia para afinar mejor los pesos.

Un peso solo tiene sentido **en relación con los demás pesos**.  
Si pones un peso de 1 al **Placaje** y 2 a las **Curaciones**, es exactamente lo mismo que poner 2 al Placaje y 4 a las Curaciones. Lo que importa es el ratio entre los pesos.

Una buena manera de pensar los pesos es poner un peso de 1 a una característica, por ejemplo **Fuerza**, y luego ir mirando las otras características preguntándote:  
«¿Cuánta Fuerza vale esta característica? ¿Prefiero tener 100 de Fuerza o 20 de Placaje?»

Si te parece equivalente, entonces 5 de Fuerza equivalen a 1 de Placaje, así que el peso del Placaje sería 5.

Si estás confiado en un ratio que ya has definido para otra característica, puedes repetir el mismo proceso tomando esa característica como base para encontrar otros ratios o comprobar que un ratio existente encaja con lo que realmente quieres.

Si no estás seguro del valor de una característica, es mejor dejar su peso vacío o bajo. Siempre podrás subirlo más adelante y comparar los resultados.

## Pesos ofensivos

El peso de la **Potencia** siempre debe ser igual a la suma de los pesos de **Fuerza, Inteligencia, Suerte y Agilidad**.  
El peso de los **Daños** debe ser igual a la suma de los pesos de daños **Neutro, Tierra, Fuego, Agua y Aire**.  
La aplicación los suma automáticamente, salvo que hayas desmarcado **«Cálculo automático de los pesos»**.

Los daños Neutro probablemente deberían dejarse a 0 o bastante bajos, porque pocos hechizos tienen una línea de daños Neutro y la mayoría de objetos que dan daños Tierra también dan daños Neutro, lo que haría que su valor se cuente dos veces.

Si juegas un build de **Crítico**, el peso de los **Daños críticos** siempre debe ser menor que el peso de los daños normales.  
Si tienes 100 % de crítico, los daños críticos son equivalentes a los daños normales, con la diferencia de que se ven afectados por la **Resistencia crítica**.

El ratio óptimo **daños elementales / potencia** que deberías usar se puede calcular con precisión según los hechizos que planees usar.

El ratio óptimo **daños / potencia** sigue la fórmula:  
**100 / daños medios base del hechizo.**

Cuanto más altos sean los daños base del hechizo, menos peso deberías poner en daños.

Por ejemplo, si solo usas el hechizo de Sacrógrito **«Aniquilamiento»**: pega de 29 a 32 daños Tierra, o sea una media de 30,5.  
El ratio sería **100 / 30,5 ≈ 3,3**.  
Si tienes un peso de 1 en Fuerza, deberías poner un peso de 3,3 en daños Tierra.

De manera general, los hechizos básicos con una sola línea de daños y sin efectos extra tienen un ratio daños / potencia:

- Entre **2 y 3** para hechizos de 4 PA
- Entre **3 y 4** para hechizos de 3 PA
- Entre **4 y 5** para hechizos de 2 PA

Los hechizos con efectos adicionales suelen tener daños base más bajos y por tanto un ratio daños / potencia más alto.

Un hechizo en crítico suele ver sus daños base multiplicados por **1,2** en la mayoría de los casos.  
El ratio daños / potencia debe dividirse por 1,2 si juegas un build de Crítico.

Calcular el peso de la **Tasa de crítico** es algo más complicado.  
Es mejor decidir de antemano si quieres jugar a Críticos y, en ese caso, usar un parámetro Min en lugar de un peso, o combinar un peso alto con un parámetro Min.

## Pesos defensivos

Los pesos de **resistencias fijas** y **resistencias elementales en porcentaje** se sincronizan si el **«Cálculo automático de los pesos»** está activado.

El ratio **resistencias % / resistencias fijas** es proporcional al daño recibido.  
Sigue esta fórmula: **ratio resistencias % / fijas = daños recibidos / 100**.

- Si los daños recibidos son 100 ⇒ ratio = 1 ⇒ el peso de resistencias elementales % debe ser igual al de resistencias fijas.
- Si los daños recibidos son 300 ⇒ ratio = 3 ⇒ el peso de resistencias elementales % debe ser 3 veces el de resistencias fijas (peso por defecto).

La mayoría de objetos de nivel 200 no tienen resistencias fijas, así que quizá no tenga mucho sentido poner peso en resistencias fijas para builds de nivel alto.

La suma de los pesos de **resistencias elementales %** debe ser igual a la suma de los pesos de **resistencias cuerpo a cuerpo y distancia %**.  
Tener 10 % de resistencias en todos los elementos es equivalente a tener 10 % de resistencia en melee y a distancia.

Sin embargo, la resistencia en porcentaje es una característica más fuerte cuanto más alta es.  
Sin entrar en detalles, pasar de 49 % a 50 % de resist es casi el doble de fuerte que pasar de 0 % a 1 %.

Por tanto, si quieres un build con muchas resistencias elementales, puedes poner más peso en resistencias elementales que en resistencias melee / distancia, ya que son más difíciles de subir.  
Pero la suma de los pesos de resistencias elementales debería seguir siendo menor que el doble de la suma de los pesos de resistencias melee / distancia en el peor de los casos.

## Min / Max

El valor de la mayoría de las características no crece de manera lineal.  
Por ejemplo, la **Prospección** pierde valor cuando es muy alta.  
Al contrario, las **resistencias fijas y en porcentaje** ganan más valor cuanto más altas son.

Además, el valor de algunas características depende de otras.  
Por ejemplo, el valor de los **daños críticos** depende mucho de la probabilidad de crítico, y al revés.

Esto significa que builds con una característica muy alta podrían eclipsar mejores opciones que tengan un reparto más equilibrado de características.  
O podrías tener un build con 200 daños críticos pero 0 % de crítico, lo cual no tiene sentido.

La manera de limitar este problema es definir parámetros **Min** y/o **Max**, de forma que la característica se mantenga en un rango que no distorsione demasiado su valor (o el de las demás características).

## Prerrequisitos con parámetros Min

Los prerrequisitos en **Vitalidad, Inteligencia, Fuerza, Suerte, Agilidad y Sabiduría** no se tienen en cuenta al calcular el mejor build, porque estas características se pueden subir mucho después con puntos de características.

Sin embargo, si quieres usar sí o sí un objeto con un prerrequisito difícil, puedes bloquear ese objeto y definir un parámetro Min para mostrar solo builds en los que sea posible alcanzar la condición.

Por ejemplo, para la **Furor de Gargandias**, que requiere al menos **5000 de Vitalidad** al nivel 200.  
Si quieres gastar como máximo **600 puntos de características** (del nivel) en Vitalidad y ya tienes al máximo el pergaminado de vita, puedes definir un Min de:

> **5000 − 600 − 100 = 4300**

El umbral inferior más cercano es **4200**, así que úsalo.  
También puedes usar objetos **over Vita** para llegar al requisito.

---

# Minmaxing

Una vez que tengas definidos unos pesos que te parezcan coherentes, puedes lanzar un cálculo de combinaciones más grande, añadiendo muchos más objetos y sets, por si existe una combinación “oculta” especialmente interesante.  
Ten en cuenta que, cuanto más bajo sea el valor de los objetos o sets que añadas, menor será la probabilidad de encontrar un build mejor.

El cálculo de combinaciones está muy optimizado, así que, si estás dispuesto a esperar, puedes darle una cantidad impresionante de objetos y sets a probar para tu build.

Si llegas a un punto en el que el cálculo tarda demasiado, puedes dividir tu búsqueda en **sub-búsquedas**.  
Es casi seguro que los mejores builds de una búsqueda llevarán al menos un set.

Puedes ir bloqueando una a una los mejores sets para tu build y lanzar búsquedas por separado.  
Esto excluye todas las combinaciones sin set en el resultado final, pero requiere más trabajo.

Bloquear dos o tres objetos reduce de forma drástica el número de combinaciones, lo que permite incluir muchos más objetos en la selección.

También puedes recalcular los mejores objetos cuando bloquees distintos sets y obtener una selección más precisa, como se explicó antes.

## Minmaxing con familiares

Los familiares que afectan a características cappeadas pueden tener un impacto enorme en el resultado de los mejores builds.  
En particular, las **resistencias elementales en porcentaje**.

Maximizar estas características es interesante porque su valor aumenta cuanto más altas son.  
Pero esto obliga a calcular muchas combinaciones, porque todas están cappeadas y hay un montón de familiares, e incluso Dofus/Trofeos, que las suben, multiplicando el número de combinaciones respecto a una búsqueda con solo unos pocos familiares.

Familiares que aumentan las resistencias elementales en porcentaje:

**Bwaks, Croum, El Scarador**

- Familiares **50 Potencia + 25 %** res elementales (5 en total)
- Familiar **50 Potencia + 5 %** res a todo (1 en total)

Estos familiares tienen mucho valor si también quieres Potencia en tu build y probablemente deberían estar en cualquier búsqueda de combinaciones orientada a altas resistencias.

**Vuelocerontes**

- **1 PA + 12 %** res Vuelocerontes (4 en total)
- **1 PA + 6 % + 6 %** res Vuelocerontes (6 en total)
- **1 PA + otra característica + 6 %** res Vuelocerontes (4 en total)

Tienen un poco menos de valor que los familiares anteriores, pero el PA que dan puede marcar una gran diferencia y ofrecen características muy flexibles.  
El problema es que tienes que añadir **14 familiares** para considerarlos todos, lo que provoca una búsqueda enorme.

Puede ser suficiente añadir solo los 4 Vuelocerontes con otra característica si la necesitas, sobre todo porque esa otra característica suele tener más valor que un 6 % de resistencias.

**Mulaguas**

- **1 PM + 16 %** res Mulaguas (4 en total)
- **1 PM + 8 % + 8 %** res Mulaguas (6 en total)
- **1 PM + otra característica + 8 %** res Mulaguas (4 en total)

Funciona igual que con los Vuelocerontes, salvo que el valor es un poco mejor.  
Normalmente es fácil llegar al tope de **6 PM**, así que recomiendo probar estos familiares solo si incluyes objetos que reducen PM o si tienes una idea muy concreta en mente.

Además de estos familiares, recomiendo incluir **un familiar sin resistencias elementales** que aporte valor a tu build, para que ese familiar se seleccione si un build ya tiene todas sus resistencias elementales cappeadas.

Este familiar debería tener menos valor que los familiares de resistencias; de lo contrario, se priorizaría incluso aunque las resistencias no estén al máximo.  
Si has incluido Vuelocerontes, también deberías añadir otro familiar que dé PA para tener una mejor comparación.

---

# Conclusión

Si se usa bien, esta aplicación es capaz de encontrar el build perfecto para lo que quieras, sea lo que sea.  
Todas las combinaciones posibles de objetos y todas las condiciones se tienen en cuenta.

La confianza en que no exista un build alternativo mejor dependerá de tu paciencia para probar todas las posibilidades.

**¡Buen minmaxing!**
