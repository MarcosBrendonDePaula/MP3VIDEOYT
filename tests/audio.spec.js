const request = require('supertest')
const app = require("../app")

describe('Teste da rota audio',()=>{
    /**
     * Checa se de alguma forma a função de download é executada sem id
     */
    it('Tentativa de download de musica sem id sincrono',async ()=>{
        const res = await request(app).post('/audio')
            .send({})
        expect(res.statusCode).toEqual(400);
        //expect(res.body).toHaveProperty('x') checa se existe o campo x
    })
     
    /**
     * Checa se de alguma forma a função de download é executada sem id
     */
    it('Tentativa de download com id asincrono',async ()=>{
        const res = await request(app).post('/audio')
        .send({
            id:"rY-FJvRqK0E"
        })
        expect(res.statusCode).toEqual(200);
    })
})