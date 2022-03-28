const request = require('supertest')
const app = require("../app")

describe('Teste da rota info',()=>{
    /**
     * 
     */
    it('informaçoes post com id',async ()=>{
        const res = await request(app).post('/info')
            .send({id:"DSMuhzSgOGE"})
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('etag')
    })
    
    it('informaçoes post sem id',async ()=>{
        const res = await request(app).post('/info')
            .send({})
        expect(res.statusCode).toEqual(400);
        //expect(res.body).toHaveProperty('etag')
    })

    it('informaçoes get com id', async ()=>{
        const res = await request(app).get('/info/get/DSMuhzSgOGE')
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('etag')
    })

    it('informaçoes sem id', async ()=>{
        const res = await request(app).get('/info/get/')
        expect(res.statusCode).toEqual(404);
    })
})