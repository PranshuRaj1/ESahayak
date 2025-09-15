"use client"
import { redirect } from "next/navigation";
import { Button } from "./ui/button";


export default function NewEntry() {
    return (
        <Button className="" onClick={() => {redirect("/buyers/new")}}> Add Entry</Button>
    )
}