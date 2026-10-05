"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import { LanguageSwitcher } from "./lang-switcher";

const PRIMARY_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/section/about", children: [{ key: "aboutHistory", href: "/section/about/history" }, { key: "aboutAchievements", href: "/section/about/achievements" }, { key: "aboutAnnouncements", href: "/section/about/announcements" }, { key: "aboutAdmission", href: "/section/about/admission" }, { key: "aboutVacancies", href: "/section/about/vacancies" }, { key: "aboutReports", href: "/section/about/reports" }] },
  { key: "councils", href: "/section/councils", children: [{ key: "councilsJointManagement", href: "/section/councils/joint-management" }, { key: "councilsPedagogical", href: "/section/councils/pedagogical" }, { key: "councilsParent", href: "/section/councils/parent" }, { key: "councilsStudent", href: "/section/councils/student" }, { key: "councilsMethodological", href: "/section/councils/methodological" }] },
  { key: "staff", href: "/section/staff", children: [{ key: "staffLeadership", href: "/section/staff/leadership" }, { key: "staffTeachers", href: "/section/staff/teachers" }, { key: "staffQualification", href: "/section/staff/qualification" }, { key: "staffResearch", href: "/section/staff/research" }] },
  { key: "resources", href: "/section/resources", children: [{ key: "resourcesClassrooms", href: "/section/resources/classrooms" }, { key: "resourcesLaboratories", href: "/section/resources/laboratories" }, { key: "resourcesComputerRoom", href: "/section/resources/computer-room" }, { key: "resourcesGym", href: "/section/resources/gym" }, { key: "resourcesMedicalRoom", href: "/section/resources/medical-room" }, { key: "resourcesCafeteria", href: "/section/resources/cafeteria" }] },
  { key: "learning", href: "/section/learning", children: [{ key: "learningExams", href: "/section/learning/exams" }, { key: "learningMaterials", href: "/section/learning/materials" }, { key: "learningProjects", href: "/section/learning/projects" }] },
  { key: "events", href: "/section/events", children: [{ key: "eventsNews", href: "/section/events/news" }, { key: "eventsEvents", href: "/section/events/events" }] },
  { key: "students", href: "/section/students", children: [{ key: "studentsAdvanced", href: "/section/students/advanced" }, { key: "studentsAwardWinners", href: "/section/students/award-winners" }, { key: "studentsAlumni", href: "/section/students/alumni" }] },
  { key: "creativity", href: "/section/creativity", children: [{ key: "creativityLiterature", href: "/section/creativity/literature" }, { key: "creativityDrawing", href: "/section/creativity/drawing" }, { key: "creativityPhotography", href: "/section/creativity/photography" }, { key: "creativityHandmade", href: "/section/creativity/handmade" }] },
  { key: "competitions", href: "/section/competitions", children: [{ key: "competitionsOlympiads", href: "/section/competitions/olympiads" }, { key: "competitionsEssays", href: "/section/competitions/essays" }, { key: "competitionsQuizzes", href: "/section/competitions/quizzes" }] },
  { key: "archive", href: "/imported" },
  { key: "contact", href: "/section/contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > 120 && currentY > previousY);
      previousY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${hidden ? " site-header--hidden" : ""}`}>
      <Link href="/" className="brand" onClick={() => setIsOpen(false)}>
        <span className="brand-mark" aria-hidden="true">Պ</span>
        <strong>{t("header.schoolName")}</strong>
      </Link>
      <button type="button" className="menu-toggle" aria-label={t("header.navAriaLabel")} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}>
        <span /><span /><span />
      </button>
      <nav className={`nav${isOpen ? " nav--open" : ""}`} aria-label={t("header.navAriaLabel")}>
        {PRIMARY_ITEMS.map((item) => {
          const hasChildren = "children" in item;
          return (
            <div className="nav-item" key={item.key}>
              <Link className="nav-link" href={item.href} onClick={() => setIsOpen(false)}>
                {t(`nav.${item.key}`)}{hasChildren ? <span className="nav-arrow">▾</span> : null}
              </Link>
              {hasChildren ? (
                <div className="dropdown" aria-label={`${t(`nav.${item.key}`)} — ${t("header.submenu")}`}>
                  {item.children.map((child) => <Link href={child.href} key={child.key} onClick={() => setIsOpen(false)}>{t(`nav.${child.key}`)}</Link>)}
                </div>
              ) : null}
            </div>
          );
        })}
        <div className="nav-language"><LanguageSwitcher /></div>
      </nav>
    </header>
  );
}
