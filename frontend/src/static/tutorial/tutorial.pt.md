# Tutorial

Este tutorial foi traduzido com o ChatGPT e provavelmente contém alguns erros.  
Os tutoriais em inglês e francês foram escritos manualmente, então, se possível, dê preferência a eles.

**Dofus Minmax** é uma aplicação que calcula os melhores builds em Dofus.  
Ela é dividida em 3 partes:

- **Peso / Min / Max (parâmetros)**: Defina o que você quer no seu build.
- **Seleção de itens**: Selecione os itens que vão entrar no cálculo das combinações.
- **Resultados dos builds**: Mostra as melhores combinações de itens encontradas.

A ideia é que, ao selecionar apenas os itens mais interessantes para as características que você quer, fica possível calcular todas as combinações viáveis e achar as melhores.

Meu objetivo é que essa aplicação seja o mais completa possível, mas também que jogadores mais casuais consigam usar. Então aqui vai o

## TL;DR:

- Clique no peso das características que você quer no seu build
- Indique o seu nível
- Clique em **« Calcular Melhores Itens »**
- Clique em **« Seleção rápida »**
- Adicione os exos PA / PM / Alcance se precisar
- Clique em **« Calcular Melhores Builds »**… e espere
- Compare os resultados
- Recomece se precisar até ficar satisfeito

---

# Uso básico

## Parâmetros de Peso / Min / Max

Os pesos servem para calcular o valor dos itens, das conjuntos e dos builds.  
Cada característica é multiplicada pelo seu peso (0 se o peso não estiver definido) para obter o valor final.

Somente os valores máximos possíveis dos itens são considerados.  
Características derivadas como tackle, fuga, iniciativa… são calculadas para cada item e conjunto no carregamento. Isso significa que você só deve colocar peso em uma característica se você valoriza o efeito base dela, não as características derivadas.  
Por exemplo: só coloque peso em sabedoria se você realmente valoriza o bônus de XP que ela dá. Colocar peso em uma característica derivada já afeta indiretamente a característica de origem.

**Min** é um limite rígido: se a característica final de um build ficar abaixo do valor que você digitou, esse build é ignorado (e o valor do build vira 0).  
**Max** é um limite “flexível”: se uma característica passar do valor Max, ela é limitada a esse valor, o que naturalmente reduz a contribuição dela no valor total do build.

Clique no peso das características para aplicar o valor padrão. Ajuste se você já tiver uma ideia do que procura. Se não tiver, tudo bem, você pode voltar e mudar depois. Você também pode remover um peso dando um duplo clique nele.

Os parâmetros **Min** para **PA, PM e Alcance** são os mais importantes se você já sabe o que quer.

Quando tiver definido seus pesos e limites Min / Max, clique em **« Calcular Melhores Itens »**. Não esqueça também de definir o nível desejado.

---

## Seleção de itens

Toda a base de dados de itens e conjuntos é utilizada como referência sempre que você clica em **« Calcular Melhores Itens »**.

Os itens com maior valor em cada categoria aparecem na primeira coluna.  
Se um item fizer parte de uma conjunto, ele também mostra o valor **“Com Conjunto”**.  
Ao passar o mouse sobre um item, você vê as informações dele.  
Ao clicar em um item, ele entra na seleção.

Se um item estiver abaixo do nível desejado, ele é ignorado.  
Um item que tem condição não vê essa condição influenciar no valor dele. Porém, se uma condição de PA / PM for incompatível com um parâmetro Min, o item é ignorado.  
Por exemplo, definir 11 PA em Min ignora todos os itens com PA < 11. Definir 12 PA e 6 PM ignora itens com PA < 12 ou PM < 6.

Efeitos especiais dos itens não entram no cálculo de valor. Pode ser necessário **travar** um item para conseguir resultados que o incluam, se boa parte do valor dele vier de um efeito especial.

As conjuntos com maior pontuação (função explicada mais abaixo) aparecem na segunda coluna.  
Ao passar o mouse em uma conjunto, você vê os bônus dela e o valor que cada quantidade de peças equipadas adiciona. Os valores mostrados são incrementais: eles mostram o valor adicionado a cada peça extra.

As **20 melhores conjuntos** aparecem por padrão.  
Se você selecionar um item de uma conjunto que não está no top 20, essa conjunto também será mostrada no final da coluna.  
Clicando em **« Selecionados »** ao lado do top 20, apenas as conjuntos que contêm pelo menos um item selecionado serão mostradas.

A terceira coluna mostra os itens selecionados por categoria. Todas as combinações possíveis dentro dessa seleção serão testadas.  
No final dessa coluna, aparece o número total de combinações, junto com o tempo estimado para calculá-las (K = mil, M = milhão, B = bilhão, T = trilhão).

O ícone de olho faz a tela rolar automaticamente até o item correspondente nas outras colunas.

Cada item pode ser **travado**, o que obriga a presença dele em todas as combinações calculadas. Isso pode reduzir muito o número de combinações. Só é possível travar um item por categoria (dois para anéis, seis para Dofus).

O objetivo é selecionar o máximo possível de itens e conjuntos interessantes, mas mantendo um número de combinações razoável.

Existem duas abordagens principais:

- Usar **« Seleção rápida »**: adiciona todos os itens visíveis das conjuntos visíveis + o item de maior valor por categoria (fora Dofus/Troféus). Mais rápido, mas potencialmente menos otimizado.
- Selecionar manualmente os itens e conjuntos que parecem relevantes.

Depois disso, verifique o total de combinações.  
Se estiver muito alto, remova algumas conjuntos piores. Tente manter abaixo de **100 milhões** em um primeiro teste.  
Não tem nenhum problema técnico em calcular muitas combinações: só vai demorar mais e esquentar sua máquina.

No final da primeira coluna, indique se você pretende ter exos PA/PM/PO no seu build.

Depois clique em **« Calcular Melhores Builds »**.

Durante o cálculo, você vê a progressão e a velocidade.  
Você pode salvar a velocidade de processamento para estimar melhor o tempo de cálculos futuros.

Quando terminar, os resultados aparecem na seção de **Builds**.

---

## Builds

Os **500 melhores resultados** aparecem, ordenados por valor. Se nenhum resultado respeitar os parâmetros Min ou outras condições, a lista fica vazia.

Se uma característica e o peso dela forem 0, essa característica não é mostrada.  
Se uma característica for diferente de 0, mas o peso for 0, ela aparece com baixa opacidade, indicando que o valor dela não influencia o build.

As características são agrupadas em 3 blocos: **Utilidade**, **Ofensivo** e **Defensivo**.  
O valor das características de cada grupo é somado e mostrado no topo de cada grupo.

Uma característica que ultrapassa o seu parâmetro Max é “capada”; uma seta cinza mostra o valor original.  
Uma característica abaixo do seu parâmetro Min aparece em vermelho e o valor do build vira 0.

Uma das funções principais dessa seção é **comparar builds**.  
Os outros builds vão mostrar as diferenças em relação ao build escolhido como referência. Para cada build, são mostradas as diferenças de:

- Valor total do build
- Valor de cada grupo de características
- Características
- Itens
- Panóplias

As condições do build são mostradas abaixo das características.  
Se uma condição estiver englobada por outra, ela é removida. Ex: PA < 11 e PA < 10 vira só PA < 10.

Se um build não respeitar uma condição de: **Vitalidade, Força, Sorte, Inteligência, Agilidade, Sabedoria** → essa condição aparece com fundo amarelo.  
Se ele não respeitar uma condição de: **Nível** ou **bônus de conjunto < 3** → a condição aparece com fundo vermelho e valor = 0.  
Todas as outras condições (PA, PM, [PA ou PM], Alcance, Invocações) se comportam como um parâmetro Max: a característica é capada.

Você pode exportar um build para **DofusDB** ou **DofusBook**.

Os 500 builds são recalculados dinamicamente se você mudar os parâmetros de peso ou Min/Max, o nível ou os exos.  
Um parâmetro Min mais restritivo pode deixar alguns builds inválidos e colocar o valor deles em 0, fazendo com que desçam para o final da lista.

Essa funcionalidade evita que você tenha que relançar cálculos gigantes para cada ajuste pequeno.  
Mas cuidado: se os parâmetros mudarem demais, pode ser necessário recalcular os melhores itens, porque podem existir itens mais interessantes ou combinações melhores.

---

## Navegação

Cada coluna tem a sua própria área de rolagem. Quando você passa o mouse por cima de uma coluna, a rolagem principal é “presa” nela.  
Para rolar a página inteira, tire o cursor de cima das colunas ou use a barra de navegação à esquerda.

As tooltips de itens/conjuntos passam a ter rolagem própria quando ficam muito grandes. A rolagem então age na tooltip, não na página.

Nos resultados, use **↑ ↓** para navegar rapidamente e **← →** para trocar de página.

---

# Builds salvos

Você pode salvar um build. Eles aparecem na seção de builds ao lado de **« Résultats »**.  
Assim como os resultados, os valores dos builds salvos são atualizados dinamicamente de acordo com os parâmetros.

Se um build salvo for idêntico a um resultado de uma nova busca, ele recupera o nome salvo.

Você também pode escolher um build salvo como referência de comparação.

---

# Buscas salvas

Todos os parâmetros de busca são codificados na URL.  
Então você pode copiar a URL, colar em uma nova aba e modificá-la para comparar duas buscas.

Os builds salvos são sincronizados entre as suas abas.  
Assim você pode fazer uma variação da busca em uma segunda aba, salvar um build e depois compará-lo com outro na primeira aba.

Você pode salvar uma busca na barra superior. Dê um nome (ex: **“Panda tank”**). O título da página é atualizado com esse nome.  
Se você modificar a busca, o texto fica laranja. Salve de novo para voltar a verde.

Para carregar uma busca, clique no nome da busca no canto superior esquerdo para mostrar todas as buscas salvas.  
Ao carregar a página, se a URL corresponder exatamente a uma busca salva, ela é carregada automaticamente.

**Atenção:** as buscas e builds salvos ficam **apenas** no armazenamento local do navegador. Eles podem ser perdidos se você limpar esse armazenamento.

Para não perder uma busca: salve a URL nos favoritos.  
Para não perder um build: exporte ele para o seu site de Dofus favorito. Você também pode exportar um build como uma nova busca e salvar a URL nos favoritos.

A busca é salva no histórico do navegador quando você:

- Clica em **« Calcular Melhores Itens »** ou **« Calcular Melhores Builds »**
- Cria, carrega, salva ou compartilha uma busca

Você pode voltar a uma versão anterior da sua busca usando o histórico. Isso preserva os resultados de uma busca.

---

# Panóplias

## Valor por item

Para calcular o valor que uma conjunto traz para um item, a aplicação calcula o valor de cada bônus da conjunto e divide pelo número de itens necessários para obter esse bônus. O melhor valor por item é o que conta.  
Esse valor aparece como **« Melhor valor per item »** e é somado ao valor de cada item da conjunto.

Na maioria dos casos, esse valor máximo corresponde à conjunto completa, mas às vezes um patamar intermediário pode ter uma média melhor.

## Score

Para calcular as melhores conjuntos, é usada uma função de pontuação (score). Não é obrigatório entender, mas aqui vai a explicação:

Para cada item da conjunto, subtrai-se o valor dele do valor do melhor item da mesma categoria. Isso representa o valor perdido por não usar o melhor item possível. Essas perdas são ordenadas da maior para a menor.  
Para cada bônus de conjunto, calcula-se o valor do bônus menos a soma das perdas dos X primeiros itens necessários, e depois divide-se pelo número total de itens da conjunto. O melhor valor obtido é o score final.

A ideia: ordenar as conjuntos pela **melhor** contribuição possível delas, levando em conta a perda potencial por não usar os melhores itens isolados de cada categoria.

Um score negativo não significa necessariamente que a conjunto é ruim: ela pode ser essencial para cumprir um parâmetro Min (geralmente PA), para evitar atingir um parâmetro Max, ou para satisfazer alguma condição.

Um ponto fraco dessa função de score é que o melhor item de uma categoria pode ser caro demais ou simplesmente não desejado. Nesses casos, uma conjunto que inclui um item dessa categoria pode ser subavaliada, mesmo sendo relevante para o seu caso.

Então não trate esse score como uma verdade absoluta. Pode ser necessário adicionar conjuntos com score mais baixo, ou remover conjuntos que não fazem sentido para a busca que você está fazendo.

## Panóplias parcialmente selecionáveis

Se uma conjunto tiver um item não selecionável porque:

- Um item passa do seu nível
- Um item com pré-requisito é incompatível com os parâmetros Min
- Um item está em uma categoria já travada

As funções de valor por item e score levam isso em conta: só as combinações possíveis são mantidas.

Se só uma peça (ou nenhuma) for selecionável, o score vira −Infinito, e a conjunto não é mostrada.

Depois de travar um item, pode ser interessante recalcular os melhores itens para obter scores atualizados. Isso vai te dizer: “considerando os itens que você travou, aqui estão os melhores itens e conjuntos que se adaptam aos espaços restantes”.  
Você pode usar essa lógica para montar um build travando aos poucos alguns itens ou conjuntos e recalculando os melhores itens a cada etapa.

## Seleção rápida

A **« Seleção rápida »** adiciona todos os itens visíveis das conjuntos visíveis. Se um item não puder ser selecionado (por causa de nível ou Min incompatível), ele não é adicionado.

Você pode ajustar a quantidade de conjuntos mostradas (Top 20) para adicionar mais ou menos itens.

A seleção rápida também adiciona o item de maior valor em cada categoria (2 nos anéis).  
A lógica é: se esse item é o melhor da categoria fora de conjunto, escolher outro costuma significar menos valor. Claro que se as características de um item interagem com valores capados, isso pode mudar bastante as coisas. Mas como estamos falando de uma seleção **rápida**, é melhor verificar que itens foram adicionados e incluir outros manualmente se você quiser resultados ainda melhores.

## Conjunto Momore

A **Conjunto Momore** é a única conjunto que tem condições próprias. Ela funciona como as condições dos itens:  
Se os seus parâmetros Min de PM / Alcance / Invocações forem incompatíveis com o bônus da conjunto, as funções de score e valor por item levam isso em conta e excluem as combinações afetadas.

Caso contrário, o valor final do build será capado de acordo com o bônus da conjunto.  
Se você quiser comparar builds que usam essa conjunto, é recomendável colocar um peso baixo ou zero nas características capadas por ela.

---

# Dofus / Troféus

Os Dofus e Troféus podem ser incluídos no cálculo das combinações.  
O uso principal deles é avaliar builds influenciados por características naturalmente capadas (Ocre, Vulbis, Sylvestre…).

## Combinações

É possível calcular várias combinações, mas cuidado: a quantidade cresce exponencialmente e normalmente não é muito interessante a menos que você tenha uma necessidade bem específica.  
É mais recomendado e mais simples manter só **uma** combinação de Dofus / Troféus por busca.

- Seleção ≤ 6 → 1 combinação
- 7 selecionados → 7 combinações
- 8 selecionados → 28 combinações
- 9 selecionados → 84 combinações

Um uso possível é comparar diferentes resultados de builds quando você estiver em dúvida sobre o último (ou os dois últimos) espaços disponíveis.  
Para isso, você precisa travar os Dofus / Troféus que tem certeza que vai usar e deixar alguns outros destravados.

Por exemplo, você pode travar 5 Dofus / Troféus e deixar **Turbulento** (+1 PA, –1 PM) e mais um outro troféu útil para o seu build destravados. Isso gera apenas 2 combinações, permitindo comparar facilmente resultados com e sem Turbulent dentro da mesma busca.

## Troféus com bônus de conjunto < 3

Se você selecionar pelo menos um Troféu que tenha como pré-requisito **“bônus de conjunto < 3”**, então são criados dois grupos de combinações:

- **Grupo 1**: somente Dofus/Troféus “clássicos”
- **Grupo 2**: os Troféus **“bônus de conjunto < 3”** têm prioridade

A ideia é comparar builds que têm a condição “bônus de conjunto < 3” com builds que não têm.  
Um build com uma condição tão restritiva tende a ser menos otimizado na maioria dos casos. Então faz sentido colocar o máximo possível desses Troféus “bônus de conjunto < 3” em um build, já que eles têm mais valor.

O primeiro grupo “clássico” corresponde às combinações de Dofus / Troféus **sem** os Troféus bônus de conjunto < 3. Ele pode ficar vazio se você só tiver esse tipo de troféu selecionado.

O segundo grupo, com bônus de conjunto < 3, é criado assim:

1. Primeiro, seleciona os Dofus / Troféus “clássicos” travados
2. Depois:
    - Se houver tantos ou mais Troféus bônus de conjunto < 3 quanto espaços restantes → cria combinações **apenas** com eles → fim
    - Senão, preenche todos os espaços restantes com os Troféus bônus de conjunto < 3
    - Se ainda sobrarem espaços e existirem Troféus clássicos não travados → cria combinações com eles nesses espaços restantes → fim

A forma mais simples de lidar com esse agrupamento é ter só uma combinação (6 itens) para cada grupo.  
Para isso, selecione 6 Dofus / Troféus “clássicos”, trave os que você quer em todos os casos e depois selecione **[6 − Dofus / Troféus clássicos travados]** Troféus bônus de conjunto < 3.  
Por exemplo: se você seleciona 6 Troféus clássicos, dos quais 2 estão travados, adicione 4 Troféus bônus de conjunto < 3.

Se você quiser fazer combinações mais complexas, comece selecionando apenas os Dofus / Troféus e veja o número de combinações.  
Você também pode calcular os melhores builds usando somente esses itens, sem nenhum outro, para verificar se as combinações geradas estão de acordo com o que você espera (nesse caso, remova todos os parâmetros Min para garantir que apareçam resultados).

Esse agrupamento **não** acontece se você travar pelo menos um Troféu bônus de conjunto < 3.  
Nesse cenário, todas as combinações são calculadas normalmente. Então, se você só quiser explorar builds com essa condição, travar um único Troféu bônus de conjunto < 3 já resolve. Pode ser mais simples, especialmente se esse esquema de agrupamento parecer confuso (o que é bem compreensível).

---

# Como definir bons parâmetros

## Pesos

Os pesos padrão vêm principalmente do custo em poço (puit), depois ajustados quando pareciam altos ou baixos demais.  
Eu comparei mascotes e runas de transcendência para chegar em pesos mais precisos.

Um peso só faz sentido **em relação aos outros pesos**.  
Se você colocar peso 1 em Tackle e 2 em Curas, isso é exatamente equivalente a colocar 2 em Tackle e 4 em Curas. O que importa é a **proporção**.

Uma boa forma de pensar nos pesos é escolher uma característica base com peso 1, por exemplo Força, e depois ir passando pelas outras características perguntando:  
“Quantos pontos de Força vale essa característica? Eu prefiro ter 100 Força ou 20 de Tackle?”  
Se for equivalente, quer dizer que 5 de Força (100 / 20) valem 1 de Tackle. Então o peso do Tackle seria 5.

Se você estiver confiante em um certo ratio que definiu entre duas características, pode repetir esse mesmo processo usando outra característica como base para encontrar novos ratios ou verificar se um ratio antigo continua fazendo sentido para o que você quer.

Se você não tiver certeza da importância de uma característica, é melhor deixar o peso dela vazio ou baixo.  
Depois você pode aumentar esse peso e comparar os resultados.

## Pesos ofensivos

O peso da **Potência** deve sempre ser igual à soma dos pesos de Força, Inteligência, Sorte e Agilidade.  
O peso de **Danos** deve sempre ser igual à soma dos pesos de danos Neutro, Terra, Fogo, Água e Ar.  
A aplicação soma isso automaticamente, a menos que você desmarque o **« Cálculo automático de pesos »**.

Os danos Neutro provavelmente deveriam ficar em 0 ou bem baixos, porque poucos feitiços têm linha de dano Neutro e a maior parte dos itens que aumentam dano Terra também aumentam dano Neutro, o que contaria esse dano duas vezes.

Se você estiver jogando um build de crítico, o peso dos **danos críticos** deve sempre ser menor do que o peso dos danos normais.  
Se você tiver 100% de chance de crítico, os danos críticos são equivalentes aos danos normais, com a diferença de que são afetados pela resistência crítica.

O ratio ideal entre danos elementares e potência pode ser calculado exatamente com base nos feitiços que você pretende usar.

O ratio ideal entre danos e potência segue a fórmula:  
**100 / dano médio base do feitiço.**  
Quanto mais alto o dano base do feitiço, **menor** o peso que você deve colocar em danos.

Por exemplo, se você usar somente o feitiço Sacrier **“Dizimação”**: ele causa de 29 a 32 de dano Terra, em média 30,5. O ratio seria 100 / 30,5 ≈ 3,3.  
Se você colocar peso 1 em Força, então deveria colocar peso 3,3 em danos Terra.

De forma geral, feitiços básicos com uma linha de dano e sem efeito extra costumam ter ratio danos / potência:

- Entre 2 e 3 para feitiços de 4 PA
- Entre 3 e 4 para feitiços de 3 PA
- Entre 4 e 5 para feitiços de 2 PA

Feitiços com efeitos adicionais geralmente têm dano base menor e, por isso, um ratio danos / potência maior.

Um feitiço em crítico normalmente tem seu dano base multiplicado por 1,2. Então o ratio danos / potência deve ser dividido por 1,2 se você estiver jogando build crítico.

Calcular o peso da chance de crítico em si é um pouco mais complicado.  
É melhor decidir antes se você quer jogar crítico e, nesse caso, usar um parâmetro Min para críticos em vez de peso, ou então usar ao mesmo tempo um peso alto e um parâmetro Min.

## Pesos defensivos

Os pesos das resistências fixas e das resistências elementares em porcentagem são sincronizados se o **« Cálculo automático de pesos »** estiver ativado.

O ratio resistências % / resistências fixas é proporcional ao dano recebido.  
A fórmula é: **ratio resistências % / fixas = dano recebido / 100**.

- Se o dano recebido é 100 ⇒ ratio = 1 ⇒ o peso das resistências elementares % deve ser igual ao das resistências fixas.
- Se o dano recebido é 300 ⇒ ratio = 3 ⇒ o peso das resistências elementares % deve ser 3 vezes o das resistências fixas (peso padrão).

A maioria dos itens de nível 200 não tem resistências fixas, então pode não ser muito útil colocar peso nelas para builds de nível alto.

A soma dos pesos das resistências elementares em % deve ser igual à soma dos pesos das resistências corpo a corpo e à distância em %.  
Ter 10% de resistência em todos os elementos é equivalente a ter 10% de resistência corpo a corpo e à distância.

No entanto, resistência em % é uma característica que fica cada vez mais forte quanto mais alta é.  
Sem entrar nos detalhes, passar de 49% para 50% de resistência é quase duas vezes mais forte do que passar de 0% para 1%.  
Então, se você quer um build com muita resistência elemental, pode colocar mais peso nas resistências elementares do que nas resistências corpo a corpo / distância, já que geralmente é mais difícil subir as primeiras. Mas a soma dos pesos das resistências elementares deve continuar menor do que o dobro da soma dos pesos das resistências corpo a corpo / distância, no limite.

## Min / Max

O valor da maioria das características não cresce de forma totalmente linear.  
Por exemplo, Prospeção perde valor quando está muito alta; já resistências fixas e em % ganham cada vez mais valor quanto maiores forem.  
Além disso, o valor de algumas características depende de outras. Em particular, o valor de danos críticos depende muito da chance de crítico, e o contrário também.

Isso significa que builds com uma característica **muito** alta podem acabar escondendo opções melhores que tenham uma distribuição mais equilibrada.  
Ou você pode acabar com um build com 200 danos críticos e 0% de chance de crítico, o que obviamente não faz sentido.

A forma de limitar esse problema é definir parâmetros Min e/ou Max, de forma que o valor da característica fique numa faixa razoável e não distorça demais o valor geral (ou o valor das outras características).

## Pré-requisitos com parâmetros Min

Os pré-requisitos de Vitalidade, Inteligência, Força, Sorte, Agilidade e Sabedoria não são considerados no cálculo do melhor build, porque essas características podem ser aumentadas bastante depois, com pontos de nível.  
Mas se você **faz questão** de usar um item com um pré-requisito difícil, pode travar esse item e definir um parâmetro Min para mostrar somente builds em que é possível atingir essa condição.

Por exemplo, a **Furor de Gargandyas** exige pelo menos 5000 de Vitalidade no nível 200.  
Se você quiser investir no máximo 600 pontos de características (do nível) em Vitalidade e já estiver com pergaminhos de Vitalidade completos, pode definir um Min de 5000 − 600 − 100 = 4300.  
O patamar inferior mais próximo é 4200, então use esse. Você também pode usar itens com over Vita para chegar no requisito.

---

# Minmaxing

Depois que você tiver pesos que parecem coerentes, pode rodar um cálculo de combinações maior, adicionando bem mais itens e conjuntos, caso exista alguma combinação “escondida” muito interessante.  
Tenha em mente que quanto menor o valor dos itens/conjuntos adicionais, menor a chance de encontrar um build realmente melhor por causa deles.

O cálculo das combinações é bem agressivamente otimizado, então, se você estiver disposto a esperar, pode dar uma quantidade grande de itens e conjuntos para a aplicação testar.

Se chegar em um ponto em que o cálculo demore demais, você pode dividir a busca em sub-buscas.  
É quase garantido que os melhores builds de uma busca vão ter pelo menos uma conjunto.  
Você pode então travar uma por uma as melhores conjuntos para o seu build e rodar buscas separadas.  
Isso exclui todas as combinações sem conjunto no build final, mas dá mais trabalho.  
Travar dois ou três itens reduz o número de combinações de forma drástica, o que permite incluir muito mais itens na seleção.

Você também pode recalcular os melhores itens quando travar conjuntos diferentes, obtendo uma seleção mais precisa como explicado antes.

## Minmaxing com mascotes

Mascotes que afetam características capadas podem ter um impacto enorme nos melhores builds, principalmente nas características de defesa elemental em %.

Maximizar essas características é interessante porque o valor delas aumenta quanto mais altas forem.  
Mas isso exige calcular muitas combinações, já que todas elas são capadas e existem muitos mascotes — e até Dofus / Troféus — que aumentam essas resistências, multiplicando o número de combinações em comparação com uma busca com poucos mascotes.

Mascotes que aumentam resistências elementares em %:

**Bwaks, Croum, El Scarador**

- Mascotes com 50 Potência + 25% resistência (5 no total)
- Mascote com 50 Potência + 5% resistência em todos os elementos (1 no total)

Esses mascotes têm um valor muito alto se você também quer Potência no seu build, e provavelmente deveriam ser incluídos em qualquer busca orientada a altas resistências.

**Vulkórnios**

- 1 PA + 12% resistências Vulkórnios (4 no total)
- 1 PA + 6% + 6% resistências Vulkórnios (6 no total)
- 1 PA + outra característica + 6% resistências Vulkórnios (4 no total)

Eles têm um pouquinho menos valor que os mascotes anteriores, mas o PA que dão pode fazer uma diferença enorme e они oferecem características bem flexíveis.  
O problema é que você precisa adicionar 14 mascotes para considerar todos, o que vira uma busca bem grande.  
Em muitos casos, basta adicionar só os 4 Vulkórnios com outra característica, se você precisar desse tipo de combinação — até porque essa outra característica muitas vezes vale mais do que 6% de resistência.

**Marmulas**

- 1 PM + 16% resistências Marmulas (4 no total)
- 1 PM + 8% + 8% resistências Marmulas (6 no total)
- 1 PM + outra característica + 8% resistências Marmulas (4 no total)

Mesma ideia dos Vulkórnios, mas com valor um pouco melhor.  
Geralmente é fácil chegar no limite de 6 PM, então eu recomendo testar esses mascotes só se você incluir itens que reduzem PM ou se tiver uma ideia bem específica em mente.

Além desses mascotes, eu recomendo incluir **um mascote sem resistências elementares**, mas que ainda traga valor para o seu build, para que ele seja escolhido se o build já tiver todas as resistências elementares capadas.  
Esse mascote deveria ter um valor menor do que os mascotes de resistência; caso contrário, ele seria escolhido mesmo quando as resistências ainda não estiverem no limite.  
Se você estiver usando Vulkórnios, também vale a pena adicionar outro mascote que dê PA, para ter uma comparação melhor.

---

# Conclusão

Se usada corretamente, essa aplicação consegue encontrar o build perfeito para aquilo que você quer, seja lá o que for. Todas as combinações possíveis de itens e todas as condições são levadas em conta.  
A confiança de que não existe um build alternativo melhor vai depender da sua paciência em testar todas as possibilidades.

Bom minmaxing!
