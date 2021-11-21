const { create } = require("ipfs-http-client");

const ipfs = create("https://ipfs.infura.io:5001");

async function run() {
  const files = [{
    path: '/',
    content: JSON.stringify({
      name: "Unicorn Icecream",
      attributes: {
        slippery: 100
      },
      image: "https://media.istockphoto.com/vectors/cute-unicorn-on-ice-cream-cone-in-cartoon-style-vector-id1178756428",
      description: "Unicorn Icecream!"
    })
  }];

  //const result = await ipfs.addAll(files);
  //console.log(result);

  for await (const result of ipfs.addAll(files)) {
    console.log(result)
  }
}

run();
