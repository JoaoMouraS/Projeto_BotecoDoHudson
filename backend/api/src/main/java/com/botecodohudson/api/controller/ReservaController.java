package com.botecodohudson.api.controller;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.service.ReservaService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaModel criarReserva(@RequestBody ReservaModel reserva) {
        return reservaService.criarReserva(reserva);
    }

     @GetMapping
    public List<ReservaModel> listarTodas() {
        return reservaService.listarTodas(); // Certifique-se de que esse método existe na sua ReservaService
    }

}
