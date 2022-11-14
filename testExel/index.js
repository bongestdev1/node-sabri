const xlsx = require('xlsx');

const workbook = xlsx.readFile("./inputFile/database.xlsx")
const worksheet = workbook.Sheets[workbook.SheetNames[0]]

let posts = []
let post = {}

for(let cell in worksheet){
    
    const cellAsString = cell.toString();

    if(cellAsString[1] !== 'r' && cellAsString !== 'm' && cellAsString[1] > 0){
      
        console.log(cellAsString)
        if(cellAsString[0] === 'A'){
            post.title = worksheet[cell].v;
        }

        if(cellAsString[0] === 'B'){
            post.author = worksheet[cell].v
        }

        console.log(post)
        posts.push(post)
        post = {}
  
    }

   
}

console.log(posts)
