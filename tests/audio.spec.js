const request = require('supertest')
const app = require("../app")

describe('Teste da rota audio',()=>{

    jest.setTimeout(30000)
    /**
     * Checa se o retorno é o esperado para a requisição
     */
    it('Tentativa de download com id sincrono',async ()=>{
        const res = await request(app).post('/audio/sync')
            .send({
                id:"rY-FJvRqK0E"
            })
        console.log(res)
        expect(res.statusCode).toEqual(200);
    })

    /**
     * Checa se de alguma forma a função de download é executada sem id
     */
    it('Tentativa de download de musica sem id sincrono',async ()=>{
        const res = await request(app).post('/audio/sync')
            .send({})
        expect(res.statusCode).toEqual(400);
        //expect(res.body).toHaveProperty('x') checa se existe o campo x
    })
     
    /**
     * Checa se de alguma forma a função de download é executada sem id
     */
    it('Tentativa de download com id asincrono',async ()=>{
        const res = await request(app).post('/audio/async')
        .send({
            id:"rY-FJvRqK0E"
        })
        expect(res.statusCode).toEqual(200);
    })
})