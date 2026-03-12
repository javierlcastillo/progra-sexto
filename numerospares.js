const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

const main = async () => {
    const rl = readline.createInterface({ input, output });
    const arreglo = [];
    console.log("Ingresa 10 numeros porfavor");
    for (let i = 0; i < 10; i++){
        const respuesta  = await rl.question(`Ingresa numero ${i + 1}: `);
        arreglo.push(Number(respuesta));
    }
    console.log("Los numeros pares del arreglo son: ");
    for (let i = 0; i < arreglo.length; i++) {
        if (arreglo[i] % 2 === 0) {
            console.log(`${arreglo[i]}`);
        }
    }
    rl.close();
    console.log("Programa finalizado.");
};

main();