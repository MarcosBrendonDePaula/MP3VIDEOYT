const request = require('supertest')

discribe('Teste do index',()=>{
    it('acesso a rota principal',async ()=>{
        const res = await request(app).get('/')
        //.send() enviar um corpo para post
        expect(res.statusCode).toEqual(200);
        //expect(res.body).toHaveProperty('x') checa se existe o campo x
    })
})